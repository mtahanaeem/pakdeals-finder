import os
from config import GROQ_API_KEY


def _rule_based_summary(live_deals, query):
    if not live_deals:
        return f"No deals found for '{query}'. Please try a different search or check back later."

    prices = [d["price_pkr"] for d in live_deals]
    min_price = min(prices)
    max_price = max(prices)
    best = min(live_deals, key=lambda x: x["price_pkr"])

    summary = f"Found {len(live_deals)} deals for '{query}'. "
    summary += f"Prices range from PKR {min_price:,} to PKR {max_price:,}. "
    summary += f"The best deal is on {best['platform']} at PKR {best['price_pkr']:,}"

    if best.get("discount_percent") and best["discount_percent"] > 0:
        summary += f" with a {best['discount_percent']}% discount"

    summary += ". "

    platforms = set(d["platform"] for d in live_deals)
    if len(platforms) > 1:
        summary += f"Compared across {', '.join(platforms)}."

    return summary


def generate_summary(augmented_prompt, live_deals=None, query=""):
    api_key = GROQ_API_KEY
    if not api_key or api_key == "your-groq-api-key-here":
        return _rule_based_summary(live_deals or [], query)

    try:
        from groq import Groq

        client = Groq(api_key=api_key)

        system_prompt = (
            "You are a helpful e-commerce deal analyst for Pakistani online stores. "
            "Ground your response ONLY in the provided data. Do not make up prices or deals. "
            "Keep responses to 3-4 sentences. Compare prices and highlight the best value."
        )

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": augmented_prompt},
            ],
            max_tokens=300,
            temperature=0.3,
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        print(f"Groq API error: {e}. Using rule-based summary.")
        return _rule_based_summary(live_deals or [], query)
