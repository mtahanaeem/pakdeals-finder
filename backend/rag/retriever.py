import os
import json
import sqlite3
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
from config import DB_PATH, FAISS_INDEX_PATH, FAISS_MAP_PATH, SIMILARITY_THRESHOLD, TOP_K_RETRIEVAL

_model = None


def _get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def retrieve(query, k=None):
    if k is None:
        k = TOP_K_RETRIEVAL

    if not os.path.exists(FAISS_INDEX_PATH) or not os.path.exists(FAISS_MAP_PATH):
        return []

    model = _get_model()
    index = faiss.read_index(FAISS_INDEX_PATH)

    with open(FAISS_MAP_PATH, "r") as f:
        id_map = json.load(f)

    query_embedding = model.encode([query])
    query_embedding = np.array(query_embedding, dtype=np.float32)

    distances, indices = index.search(query_embedding, k)

    results = []
    for dist, idx in zip(distances[0], indices[0]):
        if idx == -1:
            continue

        similarity = 1 / (1 + dist)
        if similarity < SIMILARITY_THRESHOLD:
            continue

        db_id = id_map.get(str(idx))
        if db_id is None:
            continue

        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        row = conn.execute(
            "SELECT * FROM price_history WHERE id = ?", (db_id,)
        ).fetchone()
        conn.close()

        if row:
            results.append({
                "id": row["id"],
                "product_name": row["product_name"],
                "platform": row["platform"],
                "price_pkr": row["price_pkr"],
                "original_price_pkr": row["original_price_pkr"],
                "url": row["url"],
                "scraped_date": row["scraped_date"],
                "similarity": round(similarity, 4),
            })

    return results
