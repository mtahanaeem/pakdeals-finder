import logging
import re
from config import ALGOLIA_APP_ID, ALGOLIA_API_KEY, ALGOLIA_INDEX
from scrapers.filter import filter_results

logger = logging.getLogger(__name__)


def scrape(product_name, max_results=8):
    results = []

    try:
        from algoliasearch.search.client import SearchClientSync

        client = SearchClientSync(app_id=ALGOLIA_APP_ID, api_key=ALGOLIA_API_KEY)

        response = client.search_single_index(
            index_name=ALGOLIA_INDEX,
            search_params={"query": product_name, "hitsPerPage": max_results * 2},
        )

        for hit in response.hits:
            try:
                hit_dict = hit.model_dump()
                title = (hit_dict.get("title") or "").strip()
                if not title or len(title) < 3:
                    continue

                price = 0
                if hit_dict.get("discounted_price"):
                    try:
                        price = int(float(hit_dict["discounted_price"]))
                    except (ValueError, TypeError):
                        pass
                if price <= 0 and hit_dict.get("price"):
                    try:
                        price = int(float(hit_dict["price"]))
                    except (ValueError, TypeError):
                        pass
                if price <= 0 and hit_dict.get("selling_price"):
                    try:
                        price = int(float(hit_dict["selling_price"]))
                    except (ValueError, TypeError):
                        pass

                if price <= 0:
                    continue

                orig_price = None
                if hit_dict.get("original_price"):
                    try:
                        orig_price = int(float(hit_dict["original_price"]))
                    except (ValueError, TypeError):
                        pass
                if not orig_price and hit_dict.get("mrp"):
                    try:
                        orig_price = int(float(hit_dict["mrp"]))
                    except (ValueError, TypeError):
                        pass

                discount = 0
                if orig_price and orig_price > price:
                    discount = round((1 - price / orig_price) * 100, 1)

                slug = hit_dict.get("slug") or ""
                link = f"https://www.telemart.pk/{slug}" if slug else ""

                in_stock = hit_dict.get("in_stock", True)
                if isinstance(in_stock, str):
                    in_stock = in_stock.lower() in ("true", "1", "yes", "in stock")

                results.append({
                    "title": title,
                    "price_pkr": price,
                    "original_price_pkr": orig_price or None,
                    "discount_percent": discount,
                    "url": link,
                    "platform": "Telemart",
                    "in_stock": in_stock,
                })
            except Exception as e:
                logger.warning(f"Telemart hit processing error: {e}")
                continue

    except Exception as e:
        logger.warning(f"Telemart scraper failed: {e}")

    filtered = filter_results(results, product_name)
    return filtered[:max_results]
