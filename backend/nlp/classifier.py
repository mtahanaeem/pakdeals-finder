import os
import re
import joblib
from config import CLASSIFIER_PATH


_model = None
_vectorizer = None


def _keyword_classify(query):
    q = query.lower()
    if any(w in q for w in ["compare", "vs", "versus", "difference", "better", "cheapest"]):
        return "price_comparison"
    if any(w in q for w in ["deal", "offer", "sale", "discount", "coupon", "flash"]):
        return "deal_alert"
    if any(w in q for w in ["list", "all", "browse", "category", "show me", "options", "available"]):
        return "category_browse"
    return "product_search"


def classify_intent(query):
    global _model, _vectorizer

    if _model is None:
        if os.path.exists(CLASSIFIER_PATH):
            data = joblib.load(CLASSIFIER_PATH)
            _vectorizer = data["vectorizer"]
            _model = data["model"]
        else:
            return _keyword_classify(query)

    try:
        X = _vectorizer.transform([query])
        return _model.predict(X)[0]
    except Exception:
        return _keyword_classify(query)
