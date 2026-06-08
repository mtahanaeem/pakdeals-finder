import re

EXCLUDE_WORDS = {
    "find", "search", "show", "get", "buy", "best", "cheap", "lowest", "compare",
    "price", "cost", "deal", "dealz", "deals", "sale", "offer", "offers",
    "under", "above", "between", "from", "to", "in", "on", "at", "for",
    "with", "without", "and", "or", "the", "a", "an", "my", "your", "his",
    "her", "its", "our", "their", "this", "that", "these", "those",
    "what", "which", "where", "when", "who", "how", "why",
    "pkr", "rs", "rupees", "lakh", "lac", "k",
    "daraz", "telemart", "ishopping", "shophive", "pk",
    "official", "warranty", "approved", "pta", "import", "available",
    "new", "used", "old", "refurbished", "original", "genuine",
}


def _extract_price(query):
    patterns = [
        r'(?:PKR|pkr|Rs\.?|rs\.?)\s*([\d,]+)',
        r'([\d,]+)\s*(?:rupees|pkr|PKR)',
        r'([\d,]+)k\b',
        r'([\d,]+)\s*(?:lakh|lac)',
        r'(?:under|below|max|upto|less than)\s*(?:PKR|pkr|Rs\.?|rs\.?)\s*([\d,]+)',
        r'(?:under|below|max|upto|less than)\s*([\d,]+)',
    ]
    for pattern in patterns:
        match = re.search(pattern, query, re.IGNORECASE)
        if match:
            val = match.group(1).replace(",", "")
            if "k" in pattern and "lakh" not in pattern:
                return int(val) * 1000
            if "lakh" in pattern:
                return int(val) * 100000
            return int(val)
    return None


def _extract_platform(query):
    platforms = {
        "daraz": "Daraz", "telemart": "Telemart",
        "ishopping": "iShopping", "shophive": "Shophive"
    }
    q = query.lower()
    for key, val in platforms.items():
        if key in q:
            return val
    return None


def _extract_product_name(query):
    words = query.split()
    product_words = []
    skip_next = False

    for i, w in enumerate(words):
        wl = w.lower().strip(".,!?;:")

        if wl in EXCLUDE_WORDS:
            continue

        if re.match(r'^[\d,]+$', wl.replace(".", "")):
            prev = words[i - 1].lower() if i > 0 else ""
            if prev in ("under", "below", "max", "between", "from", "to", "price", "cost"):
                continue
            product_words.append(w)
            continue

        product_words.append(w)

    result = " ".join(product_words).strip()
    if not result:
        result = " ".join(words).strip()

    result = re.sub(r'\s+', ' ', result)
    return result


PLATFORM_KEYWORDS = {
    "iPhone": "Apple", "iPad": "Apple", "MacBook": "Apple", "AirPods": "Apple",
    "Apple": "Apple", "Watch": "Apple",
    "Samsung": "Samsung", "Galaxy": "Samsung",
    "Sony": "Sony", "WH-1000XM": "Sony",
    "Dell": "Dell", "XPS": "Dell",
    "Logitech": "Logitech",
    "OnePlus": "OnePlus",
    "PlayStation": "Sony", "PS5": "Sony",
    "Xiaomi": "Xiaomi", "Redmi": "Xiaomi",
    "Oppo": "Oppo", "Vivo": "Vivo",
    "Huawei": "Huawei",
    "Tecno": "Tecno", "Infinix": "Infinix",
}

CATEGORY_KEYWORDS = {
    "phone": "Smartphones", "smartphone": "Smartphones", "mobile": "Smartphones",
    "laptop": "Laptops", "notebook": "Laptops",
    "headphone": "Audio", "earbuds": "Audio", "speaker": "Audio",
    "tv": "Televisions", "television": "Televisions",
    "tablet": "Tablets", "ipad": "Tablets",
    "mouse": "Accessories", "keyboard": "Accessories",
    "console": "Gaming", "gaming": "Gaming", "ps5": "Gaming",
    "camera": "Cameras", "watch": "Wearables",
}


def extract_entities(query):
    product_name = _extract_product_name(query)
    target_price = _extract_price(query)
    platform = _extract_platform(query)

    brand = None
    q_lower = query.lower()
    for kw, br in PLATFORM_KEYWORDS.items():
        if kw.lower() in q_lower:
            brand = br
            break

    category = None
    for kw, cat in CATEGORY_KEYWORDS.items():
        if kw in q_lower:
            category = cat
            break

    return {
        "product_name": product_name,
        "brand": brand,
        "category": category,
        "target_price": target_price,
        "platform": platform,
    }
