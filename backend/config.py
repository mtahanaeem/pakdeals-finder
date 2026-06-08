import os

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "your-groq-api-key-here")
DB_PATH = os.path.join(os.path.dirname(__file__), "data", "pakdeals.db")
FAISS_INDEX_PATH = os.path.join(os.path.dirname(__file__), "data", "faiss_index.bin")
FAISS_MAP_PATH = os.path.join(os.path.dirname(__file__), "data", "faiss_id_map.json")
CLASSIFIER_PATH = os.path.join(os.path.dirname(__file__), "data", "classifier_model.pkl")
ALGOLIA_APP_ID = os.getenv("ALGOLIA_APP_ID", "7Z6UNQYQER")
ALGOLIA_API_KEY = os.getenv("ALGOLIA_API_KEY", "9b4c33f99e845fe1363fd4c6ceb0f467")
ALGOLIA_INDEX = os.getenv("ALGOLIA_INDEX", "products")
SIMILARITY_THRESHOLD = 0.6
TOP_K_RETRIEVAL = 5
