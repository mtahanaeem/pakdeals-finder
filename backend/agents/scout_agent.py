from concurrent.futures import ThreadPoolExecutor
from scrapers.daraz_scraper import scrape as daraz_scrape
from scrapers.telemart_scraper import scrape as telemart_scrape
from scrapers.ishopping_scraper import scrape as ishopping_scrape
from scrapers.shophive_scraper import scrape as shophive_scrape


def run(entities, query="", max_results=8):
    product_name = entities.get("product_name", "") or query
    platform = entities.get("platform")

    scrapers = {
        "Daraz": daraz_scrape,
        "Telemart": telemart_scrape,
        "iShopping": ishopping_scrape,
        "Shophive": shophive_scrape,
    }

    if platform:
        scraper = scrapers.get(platform)
        if scraper:
            return scraper(product_name, max_results)
        return []

    all_results = []
    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = {
            name: executor.submit(scraper, product_name, max_results)
            for name, scraper in scrapers.items()
        }
        for name, future in futures.items():
            try:
                results = future.result(timeout=15)
                all_results.extend(results)
            except Exception as e:
                print(f"Scout agent: {name} scraper failed: {e}")

    return all_results
