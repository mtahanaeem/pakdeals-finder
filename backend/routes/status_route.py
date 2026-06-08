from flask import Blueprint, jsonify
from routes.search_route import get_global_status

status_bp = Blueprint("status", __name__)


@status_bp.route("/api/status", methods=["GET"])
def status():
    gs = get_global_status()
    steps = [
        {"name": "Classifier", "desc": "TF-IDF SVM", "done": gs["step"] > 1},
        {"name": "NER", "desc": "entity extraction", "done": gs["step"] > 2},
        {"name": "Scout Agent", "desc": "live scrape", "done": gs["step"] > 3},
        {"name": "FAISS", "desc": "retrieve", "done": gs["step"] > 4},
        {"name": "Analyze", "desc": "scoring", "done": gs["step"] > 5},
        {"name": "Llama 3.1", "desc": "summary gen", "done": gs["step"] >= 6},
    ]
    return jsonify({
        "status": gs["status"],
        "progress": gs["progress"],
        "step": gs["step"],
        "steps": steps,
    })
