from flask import Blueprint, request, jsonify
from agents.pipeline import run_pipeline
from database.db import get_connection
from rag.indexer import add_to_index
from datetime import datetime

search_bp = Blueprint("search", __name__)

_global_status = {"status": "idle", "progress": 0, "step": 0}


def get_global_status():
    return _global_status


def set_global_status(status, progress, step=0):
    _global_status["status"] = status
    _global_status["progress"] = progress
    _global_status["step"] = step


@search_bp.route("/api/search", methods=["POST"])
def search():
    data = request.get_json()
    if not data or "query" not in data:
        return jsonify({"error": "Missing 'query' field"}), 400

    query = data["query"].strip()
    entities = data.get("entities", {})

    if not query:
        return jsonify({"error": "Query cannot be empty"}), 400

    try:
        set_global_status("Classifying intent...", 10, 1)
        result = run_pipeline(query, entities)

        deals = result.get("deals", [])
        for deal in deals:
            try:
                conn = get_connection()
                cursor = conn.execute(
                    "INSERT INTO price_history (product_name, platform, price_pkr, original_price_pkr, url, scraped_date) VALUES (?, ?, ?, ?, ?, ?)",
                    (
                        deal.get("title", query),
                        deal.get("platform", "Unknown"),
                        deal.get("price_pkr", 0),
                        deal.get("original_price_pkr"),
                        deal.get("url", ""),
                        datetime.now().strftime("%Y-%m-%d"),
                    )
                )
                conn.commit()
                db_id = cursor.lastrowid
                conn.close()

                add_to_index({
                    "product_name": deal.get("title", query),
                    "platform": deal.get("platform", "Unknown"),
                    "price_pkr": deal.get("price_pkr", 0),
                    "original_price_pkr": deal.get("original_price_pkr"),
                    "url": deal.get("url", ""),
                    "scraped_date": datetime.now().strftime("%Y-%m-%d"),
                })
            except Exception as e:
                print(f"Failed to store deal: {e}")

        prices = [d["price_pkr"] for d in deals if d.get("price_pkr")]
        best_price = min(prices) if prices else 0
        avg_price = round(sum(prices) / len(prices)) if prices else 0
        fake_sales = len([d for d in deals if (d.get("deal_score") or 0) < 60])

        platforms_data = {}
        for d in deals:
            p = d.get("platform", "Unknown")
            if p not in platforms_data:
                platforms_data[p] = {"count": 0, "prices": [], "best_score": 0}
            platforms_data[p]["count"] += 1
            platforms_data[p]["prices"].append(d.get("price_pkr", 0))
            platforms_data[p]["best_score"] = max(platforms_data[p]["best_score"], d.get("deal_score", 0))

        platform_summary = []
        for p, v in platforms_data.items():
            platform_summary.append({
                "platform": p,
                "listings": v["count"],
                "avg_price": round(sum(v["prices"]) / len(v["prices"])) if v["prices"] else 0,
                "best_score": v["best_score"],
            })

        set_global_status("Complete", 100, 6)

        return jsonify({
            "deals": deals,
            "summary": result.get("summary", ""),
            "query": query,
            "metrics": {
                "total_deals": len(deals),
                "best_price": best_price,
                "avg_price": avg_price,
                "fake_sales": fake_sales,
            },
            "platform_summary": platform_summary,
        })
    except Exception as e:
        set_global_status("Error", 0, 0)
        return jsonify({"error": str(e)}), 500
