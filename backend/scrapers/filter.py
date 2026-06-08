import re


IRRELEVANT_KEYWORDS = [
    "case", "cover", "protector", "tempered", "film", "pouch", "sleeve",
    "holder", "stand", "mount", "charger", "cable", "adapter", "converter",
    "earphone", "earbuds", "headset", "strap", "band", "sticker", "skin",
    "decal", "wrap", "armband", "holster", "clip", "ring", "popsocket",
    "wallet", "flip", "clear", "silicone", "leather", "rubber", "tpu",
    "back cover", "front cover", "back sheet", "sheet", "screen guard", "privacy filter",
    "car mount", "desk stand", "tripod", "selfie stick",
    "memory card", "sd card", "usb", "otg",
    "repair", "tool", "screwdriver", "opener",
    "manual", "book", "guide",
    "refurbished", "used", "pre-owned",
    "fake", "replica", "copy", "clone",
    "splitter", "hub", "dock", "docking", "extender", "repeater",
    "router", "switch", "patch", "antenna",
    "laminating", "vacuum", "cleaning", "cleaner", "brush",
    "printer", "ink", "toner", "cartridge",
    "power supply", "psu", "surge", "ups", "inverter",
    "projector", "screen", "tripod", "gimbal",
    "drone", " rc ", "remote control",
    "toy", "figure", "doll", "puzzle", "game board",
    "bag", "backpack", "laptop bag", "sleeve",
    "decal", "sticker", "vinyl", "skin",
]


MAX_REASONABLE_PRICES = {
    "phone": 500000,
    "iphone": 500000,
    "samsung": 400000,
    "laptop": 600000,
    "macbook": 600000,
    "headphone": 150000,
    "earbuds": 100000,
    "tv": 500000,
    "ps5": 200000,
    "console": 200000,
    "tablet": 400000,
    "ipad": 400000,
    "mouse": 50000,
    "keyboard": 50000,
    "camera": 800000,
    "watch": 300000,
    "default": 500000,
}


def _get_max_price(title):
    title_lower = title.lower()
    for key, max_p in MAX_REASONABLE_PRICES.items():
        if key in title_lower:
            return max_p
    return MAX_REASONABLE_PRICES["default"]


def is_relevant(title, query):
    title_lower = title.lower()
    query_lower = query.lower()
    query_words = set(query_lower.split())

    for kw in IRRELEVANT_KEYWORDS:
        if kw in title_lower:
            return False

    title_words = set(title_lower.split())

    query_words_clean = {w for w in query_words if len(w) > 2}
    if query_words_clean:
        overlap = query_words_clean & title_words
        min_overlap = 2 if len(query_words_clean) >= 3 else 1
        if len(overlap) < min_overlap:
            has_brand = any(
                brand in title_lower
                for brand in ["apple", "samsung", "sony", "dell", "hp", "lenovo",
                              "asus", "lg", "oneplus", "xiaomi", "oppo", "vivo",
                              "tecno", "infinix", "macbook", "iphone", "ipad",
                              "galaxy", "playstation", "nokia", "google", "pixel",
                              "motorola", "realme"]
            )
            if not has_brand:
                return False
            matched_words = sum(
                1 for w in query_words_clean if w in title_lower
            )
            if matched_words < min_overlap:
                return False

    if any(c.isdigit() for c in query):
        query_digit_words = {w for w in query_words if any(c.isdigit() for c in w)}
        if query_digit_words:
            title_digit_words = {w for w in title_words if any(c.isdigit() for c in w)}
            if not (query_digit_words & title_digit_words):
                return False

    return True


def filter_results(results, query):
    filtered = []
    for r in results:
        price = r.get("price_pkr", 0)
        if price <= 0 or price > _get_max_price(r.get("title", "")):
            continue
        if not is_relevant(r.get("title", ""), query):
            continue
        filtered.append(r)
    return filtered
