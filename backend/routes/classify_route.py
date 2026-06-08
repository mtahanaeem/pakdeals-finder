from flask import Blueprint, request, jsonify
from nlp.classifier import classify_intent

classify_bp = Blueprint("classify", __name__)


@classify_bp.route("/api/classify", methods=["POST"])
def classify():
    data = request.get_json()
    if not data or "query" not in data:
        return jsonify({"error": "Missing 'query' field"}), 400

    query = data["query"].strip()
    if not query:
        return jsonify({"error": "Query cannot be empty"}), 400

    try:
        intent = classify_intent(query)
        return jsonify({"intent": intent, "query": query})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
