from flask import Blueprint, request, jsonify
from nlp.ner_extractor import extract_entities

extract_bp = Blueprint("extract", __name__)


@extract_bp.route("/api/extract", methods=["POST"])
def extract():
    data = request.get_json()
    if not data or "query" not in data:
        return jsonify({"error": "Missing 'query' field"}), 400

    query = data["query"].strip()
    if not query:
        return jsonify({"error": "Query cannot be empty"}), 400

    try:
        entities = extract_entities(query)
        return jsonify(entities)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
