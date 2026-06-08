import logging
import time
import re
from scrapers.filter import filter_results

logger = logging.getLogger(__name__)

SEARCH_URL = "https://www.daraz.pk/catalog/?q={query}"


def scrape(product_name, max_results=8):
    from playwright.sync_api import sync_playwright

    results = []
    url = SEARCH_URL.format(query=product_name.replace(" ", "+"))

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
                locale="en-PK",
            )
            page = context.new_page()
            page.goto(url, wait_until="domcontentloaded", timeout=30000)
            time.sleep(4)

            try:
                page.wait_for_selector('div[data-tracking="product-card"]', timeout=15000)
            except Exception:
                browser.close()
                return []

            cards = page.query_selector_all('div[data-tracking="product-card"]')

            for card in cards[:max_results * 2]:
                try:
                    title_el = card.query_selector(".RfADt a")
                    if not title_el:
                        continue

                    title = title_el.get_attribute("title") or title_el.inner_text()
                    title = title.strip()
                    if not title or len(title) < 3:
                        continue

                    href = title_el.get_attribute("href") or ""
                    if href.startswith("//"):
                        href = "https:" + href

                    price = 0
                    price_el = card.query_selector(".aBrP0 .ooOxS")
                    if price_el:
                        price_text = price_el.inner_text()
                        digits = re.sub(r"[^\d]", "", price_text)
                        if digits:
                            price = int(digits)

                    if price <= 0:
                        continue

                    discount = 0
                    discount_el = card.query_selector(".WNoq3 .IcOsH")
                    if discount_el:
                        disc_text = discount_el.inner_text()
                        m = re.search(r"(\d+)%", disc_text)
                        if m:
                            discount = int(m.group(1))

                    orig_price = None
                    if discount > 0 and price > 0:
                        orig_price = round(price / (1 - discount / 100))

                    results.append({
                        "title": title,
                        "price_pkr": price,
                        "original_price_pkr": orig_price,
                        "discount_percent": discount,
                        "url": href,
                        "platform": "Daraz",
                        "in_stock": True,
                    })
                except Exception:
                    continue

            browser.close()

    except Exception as e:
        logger.warning(f"Daraz scraper failed: {e}")

    filtered = filter_results(results, product_name)
    return filtered[:max_results]
