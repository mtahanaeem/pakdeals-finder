import sqlite3
import os
from config import DB_PATH


def get_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS price_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_name TEXT NOT NULL,
            platform TEXT NOT NULL,
            price_pkr INTEGER NOT NULL,
            original_price_pkr INTEGER,
            url TEXT,
            scraped_date TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()
