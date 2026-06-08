from rag.retriever import retrieve
from rag.augmentor import compute_deal_score


def _normalize_price(price):
    if isinstance(price, str):
        return int("".join(filter(str.isdigit, price)))
    return int(price) if price else 0


def _fuzzy_duplicate(title1, title2):
    t1 = set(title1.lower().split())
    t2 = set(title2.lower().split())
    if not t1 or not t2:
        return False
    overlap = len(t1 & t2) / max(len(t1), len(t2))
    return overlap > 0.85


def run(raw_listings, entities):
    seen_titles = []
    unique_listings = []
    for listing in raw_listings:
        is_dup = False
        for seen in seen_titles:
            if _fuzzy_duplicate(listing.get("title", ""), seen):
                is_dup = True
                break
        if not is_dup:
            unique_listings.append(listing)
            seen_titles.append(listing.get("title", ""))

    for listing in unique_listings:
        listing["price_pkr"] = _normalize_price(listing.get("price_pkr", 0))
        if listing.get("original_price_pkr"):
            listing["original_price_pkr"] = _normalize_price(listing["original_price_pkr"])

    query = entities.get("product_name", "")
    history = retrieve(query) if query else []

    for listing in unique_listings:
        listing["deal_score"] = compute_deal_score(listing["price_pkr"], history)

    unique_listings.sort(key=lambda x: x.get("deal_score", 0), reverse=True)

    return unique_listings
