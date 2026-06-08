import os
import sys
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
sys.path.insert(0, os.path.dirname(__file__))

from flask import Flask
from flask_cors import CORS

from database.db import init_db
from database.seed_data import seed_database
from config import CLASSIFIER_PATH, FAISS_INDEX_PATH


def create_app():
    app = Flask(__name__)
    CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"])

    print("Initializing database...")
    init_db()
    seed_database()

    print("Training classifier...")
    if not os.path.exists(CLASSIFIER_PATH):
        from nlp.train_classifier import train
        train()
    else:
        print("Classifier already trained.")

    print("Building FAISS index...")
    if not os.path.exists(FAISS_INDEX_PATH):
        from rag.indexer import build_index
        build_index()
    else:
        print("FAISS index already exists.")

    from routes.classify_route import classify_bp
    from routes.extract_route import extract_bp
    from routes.search_route import search_bp
    from routes.history_route import history_bp
    from routes.status_route import status_bp

    app.register_blueprint(classify_bp)
    app.register_blueprint(extract_bp)
    app.register_blueprint(search_bp)
    app.register_blueprint(history_bp)
    app.register_blueprint(status_bp)

    @app.route("/api/health")
    def health():
        return {"status": "ok", "message": "PakDeals Finder API is running"}

    return app


if __name__ == "__main__":
    app = create_app()
    print("Starting PakDeals Finder API on http://localhost:5000")
    app.run(debug=True, host="0.0.0.0", port=5000)
