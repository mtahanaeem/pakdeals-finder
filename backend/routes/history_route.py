from flask import Blueprint, jsonify
import sqlite3
from urllib.parse import unquote
from config import DB_PATH

history_bp = Blueprint("history", __name__)


@history_bp.route("/api/history/<path:product_id>", methods=["GET"])
def get_history(product_id):
    product_name = unquote(product_id)

    if not product_name:
        return jsonify({"error": "Product name is required"}), 400

    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        rows = conn.execute(
            "SELECT platform, price_pkr, scraped_date, product_name FROM price_history WHERE product_name LIKE ? ORDER BY scraped_date ASC",
            (f"%{product_name}%",)
        ).fetchall()
        conn.close()

        history = [
            {
                "platform": row["platform"],
                "price_pkr": row["price_pkr"],
                "date": row["scraped_date"],
            }
            for row in rows
        ]

        return jsonify({
            "product": product_name,
            "history": history,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
