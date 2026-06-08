def compute_deal_score(current_price, retrieved_records):
    if not retrieved_records:
        return 50

    prices = [r["price_pkr"] for r in retrieved_records if r.get("price_pkr")]
    if not prices:
        return 50

    avg_price = sum(prices) / len(prices)
    if avg_price == 0:
        return 50

    score = round((1 - current_price / avg_price) * 100)
    return max(0, min(100, score))


def build_prompt(query, live_deals, history):
    parts = []
    parts.append("You are a helpful e-commerce deal analyst for Pakistani online stores.")
    parts.append(f"User query: {query}\n")

    if history:
        parts.append("Historical price data (last 6 months):")
        for h in history[:10]:
            parts.append(f"- {h.get('platform', 'N/A')}: {h.get('product_name', 'N/A')} at PKR {h.get('price_pkr', 0)} on {h.get('scraped_date', 'N/A')}")
        parts.append("")

    if live_deals:
        parts.append("Current live deals found:")
        for d in live_deals[:5]:
            discount = f" ({d.get('discount_percent', 0)}% off)" if d.get('discount_percent') else ""
            score = f" [Deal Score: {d.get('deal_score', 'N/A')}]" if d.get('deal_score') is not None else ""
            parts.append(f"- {d.get('platform', 'N/A')}: {d.get('title', 'N/A')} at PKR {d.get('price_pkr', 0)}{discount}{score}")
        parts.append("")

    parts.append("Provide a 3-4 sentence summary comparing these deals. Highlight the best value option and any notable price trends.")
    return "\n".join(parts)
