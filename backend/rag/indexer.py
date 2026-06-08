import os
import json
import sqlite3
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
from config import DB_PATH, FAISS_INDEX_PATH, FAISS_MAP_PATH

_model = None


def _get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def _serialize_record(row):
    return f"{row[1]} | {row[0]} | PKR {row[2]} | {row[5]}"


def build_index():
    model = _get_model()

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.execute("SELECT id, product_name, platform, price_pkr, url, scraped_date FROM price_history")
    rows = cursor.fetchall()
    conn.close()

    if not rows:
        return

    texts = [_serialize_record(row) for row in rows]
    ids = [row[0] for row in rows]

    embeddings = model.encode(texts, show_progress_bar=False)
    embeddings = np.array(embeddings, dtype=np.float32)

    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings)

    os.makedirs(os.path.dirname(FAISS_INDEX_PATH), exist_ok=True)
    faiss.write_index(index, FAISS_INDEX_PATH)

    id_map = {str(i): ids[i] for i in range(len(ids))}
    with open(FAISS_MAP_PATH, "w") as f:
        json.dump(id_map, f)

    print(f"FAISS index built: {len(ids)} records, dimension={dimension}")


def add_to_index(record):
    model = _get_model()

    text = f"{record['platform']} | {record['product_name']} | PKR {record['price_pkr']} | {record.get('scraped_date', '')}"
    embedding = model.encode([text])
    embedding = np.array(embedding, dtype=np.float32)

    if os.path.exists(FAISS_INDEX_PATH):
        index = faiss.read_index(FAISS_INDEX_PATH)
        with open(FAISS_MAP_PATH, "r") as f:
            id_map = json.load(f)
    else:
        dimension = embedding.shape[1]
        index = faiss.IndexFlatL2(dimension)
        id_map = {}

    new_id = index.ntotal
    index.add(embedding)

    db_conn = sqlite3.connect(DB_PATH)
    cursor = db_conn.execute(
        "INSERT INTO price_history (product_name, platform, price_pkr, original_price_pkr, url, scraped_date) VALUES (?, ?, ?, ?, ?, ?)",
        (record.get("product_name", ""), record.get("platform", ""), record.get("price_pkr", 0), record.get("original_price_pkr"), record.get("url", ""), record.get("scraped_date", ""))
    )
    db_row_id = cursor.lastrowid
    db_conn.commit()
    db_conn.close()

    id_map[str(new_id)] = db_row_id

    faiss.write_index(index, FAISS_INDEX_PATH)
    with open(FAISS_MAP_PATH, "w") as f:
        json.dump(id_map, f)
