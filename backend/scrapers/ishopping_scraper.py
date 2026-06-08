import logging
import re
import time
from scrapers.filter import filter_results

logger = logging.getLogger(__name__)

SEARCH_URL = "https://www.ishopping.pk/catalogsearch/result/?q={query}"


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
            time.sleep(6)

            try:
                page.wait_for_selector("ol.product-items > li.item, .product-item-info", timeout=12000)
            except Exception:
                browser.close()
                return []

            items = page.query_selector_all("ol.product-items > li.item")
            if not items:
                items = page.query_selector_all(".product-item-info")

            for item in items[:max_results * 2]:
                try:
                    title_el = item.query_selector("a.product-item-link")
                    if not title_el:
                        title_el = item.query_selector("strong.product-item-name a")
                    if not title_el:
                        title_el = item.query_selector(".product-item-name a")
                    if not title_el:
                        continue

                    title = (title_el.get_attribute("title") or title_el.inner_text()).strip()
                    if not title or len(title) < 3:
                        continue

                    link = title_el.get_attribute("href") or ""

                    price = 0
                    price_wrapper = item.query_selector("span.price-wrapper[data-price-amount]")
                    if price_wrapper:
                        price = int(float(price_wrapper.get_attribute("data-price-amount")))

                    if price <= 0:
                        price_el = item.query_selector("div.price-box span.price")
                        if price_el:
                            price_text = price_el.inner_text()
                            digits = re.sub(r"[^\d]", "", price_text)
                            if digits:
                                price = int(digits)

                    if price <= 0:
                        continue

                    orig_price = None
                    old_price = item.query_selector("span.old-price span.price")
                    if old_price:
                        orig_digits = re.sub(r"[^\d]", "", old_price.inner_text())
                        if orig_digits:
                            orig_price = int(orig_digits)

                    special_price = item.query_selector("span.special-price span.price")
                    if special_price:
                        sp_digits = re.sub(r"[^\d]", "", special_price.inner_text())
                        if sp_digits:
                            price = int(sp_digits)

                    discount = 0
                    if orig_price and orig_price > price:
                        discount = round((1 - price / orig_price) * 100, 1)

                    results.append({
                        "title": title,
                        "price_pkr": price,
                        "original_price_pkr": orig_price,
                        "discount_percent": discount,
                        "url": link,
                        "platform": "iShopping",
                        "in_stock": True,
                    })
                except Exception:
                    continue

            browser.close()

    except Exception as e:
        logger.warning(f"iShopping scraper failed: {e}")

    filtered = filter_results(results, product_name)
    return filtered[:max_results]
