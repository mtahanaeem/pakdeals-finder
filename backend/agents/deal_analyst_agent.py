from rag.retriever import retrieve
from rag.augmentor import build_prompt
from rag.generator import generate_summary


def run(ranked_deals, entities):
    query = entities.get("product_name", "")
    top_deals = ranked_deals[:5]
    history = retrieve(query) if query else []

    augmented_prompt = build_prompt(query, top_deals, history)

    summary = generate_summary(augmented_prompt, live_deals=top_deals, query=query)

    return summary
