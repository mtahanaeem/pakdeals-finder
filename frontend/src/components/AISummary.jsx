export default function AISummary({ summary, darkMode }) {
  if (!summary) return (
    <div className="ai-summary">
      <div className="ai-summary-head">
        <span style={{fontSize:16,color:'var(--brand)'}}>&#x2728;</span>
        <span className="ai-label">AI-generated (live-scraped)</span>
        <span className="ai-model">Llama 3.1-8B · Groq API · no embedded data</span>
      </div>
      <div className="ai-text">
        No embedded product data is used. All deal information comes from live scraping of Pakistani e-commerce platforms (<strong>Daraz.pk</strong>, <strong>Telemart.pk</strong>, <strong>iShopping.pk</strong>, <strong>Shophive.pk</strong>). Use the search bar above to scrape live deals.
      </div>
    </div>
  );

  return (
    <div className="ai-summary">
      <div className="ai-summary-head">
        <span style={{fontSize:16,color:'var(--brand)'}}>&#x2728;</span>
        <span className="ai-label">AI-generated (live-scraped)</span>
        <span className="ai-model">Llama 3.1-8B · Groq API · RAG-grounded</span>
      </div>
      <div className="ai-text">{summary}</div>
    </div>
  );
}
