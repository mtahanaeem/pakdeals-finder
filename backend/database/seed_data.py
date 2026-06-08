import sqlite3
import os
from database.db import get_connection, init_db


def seed_database():
    init_db()
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM price_history")
    if cursor.fetchone()[0] > 0:
        conn.close()
        return

    products = [
        {
            "name": "iPhone 15 Pro 256GB",
            "base_price": 289900,
            "platforms": {
                "Daraz": {"offset": -5000, "url": "https://www.daraz.pk/products/iphone15pro"},
                "Telemart": {"offset": 2000, "url": "https://www.telemart.pk/products/iphone15pro"},
                "iShopping": {"offset": 5000, "url": "https://www.ishopping.pk/products/iphone15pro"},
                "Shophive": {"offset": 3000, "url": "https://www.shophive.com/products/iphone15pro"},
            }
        },
        {
            "name": "Samsung Galaxy S24 Ultra 256GB",
            "base_price": 259900,
            "platforms": {
                "Daraz": {"offset": -8000, "url": "https://www.daraz.pk/products/galaxys24ultra"},
                "Telemart": {"offset": 0, "url": "https://www.telemart.pk/products/galaxys24ultra"},
                "iShopping": {"offset": 4000, "url": "https://www.ishopping.pk/products/galaxys24ultra"},
                "Shophive": {"offset": -2000, "url": "https://www.shophive.com/products/galaxys24ultra"},
            }
        },
        {
            "name": "MacBook Air M2 13-inch 256GB",
            "base_price": 269900,
            "platforms": {
                "Daraz": {"offset": -6000, "url": "https://www.daraz.pk/products/macbookairm2"},
                "Telemart": {"offset": 1000, "url": "https://www.telemart.pk/products/macbookairm2"},
                "iShopping": {"offset": 6000, "url": "https://www.ishopping.pk/products/macbookairm2"},
                "Shophive": {"offset": -3000, "url": "https://www.shophive.com/products/macbookairm2"},
            }
        },
        {
            "name": "Dell XPS 13 Intel i7 16GB RAM",
            "base_price": 199900,
            "platforms": {
                "Daraz": {"offset": -4000, "url": "https://www.daraz.pk/products/dellxps13"},
                "Telemart": {"offset": -1000, "url": "https://www.telemart.pk/products/dellxps13"},
                "iShopping": {"offset": 5000, "url": "https://www.ishopping.pk/products/dellxps13"},
                "Shophive": {"offset": -5000, "url": "https://www.shophive.com/products/dellxps13"},
            }
        },
        {
            "name": "Sony WH-1000XM5 Headphones",
            "base_price": 74900,
            "platforms": {
                "Daraz": {"offset": -3000, "url": "https://www.daraz.pk/products/sonywh1000xm5"},
                "Telemart": {"offset": 0, "url": "https://www.telemart.pk/products/sonywh1000xm5"},
                "iShopping": {"offset": 3000, "url": "https://www.ishopping.pk/products/sonywh1000xm5"},
                "Shophive": {"offset": -1500, "url": "https://www.shophive.com/products/sonywh1000xm5"},
            }
        },
        {
            "name": "Samsung 55 inch QLED 4K Smart TV",
            "base_price": 149900,
            "platforms": {
                "Daraz": {"offset": -7000, "url": "https://www.daraz.pk/products/samsung55qled"},
                "Telemart": {"offset": -2000, "url": "https://www.telemart.pk/products/samsung55qled"},
                "iShopping": {"offset": 4000, "url": "https://www.ishopping.pk/products/samsung55qled"},
                "Shophive": {"offset": 1000, "url": "https://www.shophive.com/products/samsung55qled"},
            }
        },
        {
            "name": "PlayStation 5 Console",
            "base_price": 119900,
            "platforms": {
                "Daraz": {"offset": -5000, "url": "https://www.daraz.pk/products/ps5"},
                "Telemart": {"offset": 2000, "url": "https://www.telemart.pk/products/ps5"},
                "iShopping": {"offset": 6000, "url": "https://www.ishopping.pk/products/ps5"},
                "Shophive": {"offset": -1000, "url": "https://www.shophive.com/products/ps5"},
            }
        },
        {
            "name": "Logitech MX Master 3S Mouse",
            "base_price": 18900,
            "platforms": {
                "Daraz": {"offset": -1500, "url": "https://www.daraz.pk/products/mxmaster3s"},
                "Telemart": {"offset": 0, "url": "https://www.telemart.pk/products/mxmaster3s"},
                "iShopping": {"offset": 2000, "url": "https://www.ishopping.pk/products/mxmaster3s"},
                "Shophive": {"offset": -800, "url": "https://www.shophive.com/products/mxmaster3s"},
            }
        },
        {
            "name": "iPad Air M1 64GB WiFi",
            "base_price": 129900,
            "platforms": {
                "Daraz": {"offset": -4000, "url": "https://www.daraz.pk/products/ipadairm1"},
                "Telemart": {"offset": 1000, "url": "https://www.telemart.pk/products/ipadairm1"},
                "iShopping": {"offset": 5000, "url": "https://www.ishopping.pk/products/ipadairm1"},
                "Shophive": {"offset": -2000, "url": "https://www.shophive.com/products/ipadairm1"},
            }
        },
        {
            "name": "OnePlus 12 256GB",
            "base_price": 159900,
            "platforms": {
                "Daraz": {"offset": -6000, "url": "https://www.daraz.pk/products/oneplus12"},
                "Telemart": {"offset": 0, "url": "https://www.telemart.pk/products/oneplus12"},
                "iShopping": {"offset": 3000, "url": "https://www.ishopping.pk/products/oneplus12"},
                "Shophive": {"offset": -3000, "url": "https://www.shophive.com/products/oneplus12"},
            }
        },
    ]

    dates = []
    for month in range(11, 13):
        for day in [5, 15, 25]:
            dates.append(f"2025-{month:02d}-{day:02d}")
    for month in range(1, 6):
        for day in [5, 15, 25]:
            dates.append(f"2026-{month:02d}-{day:02d}")

    sale_months = {3, 4}

    records = []
    for product in products:
        for date in dates:
            month = int(date.split("-")[1])
            for platform, info in product["platforms"].items():
                base = product["base_price"] + info["offset"]
                variation = hash(f"{product['name']}{platform}{date}") % 6000 - 3000
                price = base + variation
                if month in sale_months:
                    price = int(price * 0.92)
                price = max(price, 1000)
                orig = int(price * 1.15)
                url = info["url"] + f"?d={date}"
                records.append((product["name"], platform, price, orig, url, date))

    cursor.executemany(
        "INSERT INTO price_history (product_name, platform, price_pkr, original_price_pkr, url, scraped_date) VALUES (?, ?, ?, ?, ?, ?)",
        records
    )
    conn.commit()
    conn.close()
