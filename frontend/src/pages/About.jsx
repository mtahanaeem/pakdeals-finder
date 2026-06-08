export default function About({ darkMode }) {
  return (
    <div style={{padding:16,maxWidth:960,margin:'0 auto'}}>
      <div className="ppipeline" style={{marginBottom:16}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
          <div className="ppipe-icon ppipe-done" style={{width:36,height:36,fontSize:18}}>&#x1F4E6;</div>
          <div>
            <div style={{fontSize:16,fontWeight:600}}>PakDeals Finder</div>
            <div style={{fontSize:11,color:'var(--brand)',fontFamily:'Space Mono'}}>AI-Powered Deal Aggregator</div>
          </div>
        </div>
        <div style={{fontSize:13,color:'var(--t2)',lineHeight:1.7}}>
          An AI-powered multi-platform deal aggregator for Pakistani e-commerce platforms. Compares prices across
          <strong> Daraz</strong>, <strong>Telemart</strong>, <strong>iShopping</strong>, and <strong>Shophive</strong> using
          a RAG pipeline with 6 months of historical price data to provide accurate deal scores and AI-generated summaries.
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
        <div className="ppipeline">
          <div style={{fontSize:13,fontWeight:500,marginBottom:8}}>Frontend</div>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {[['React 18 + Vite','UI framework'],['Tailwind CSS','styling'],['Chart.js','price charts'],['React Router v6','routing'],['Axios','API calls']].map(([n,d]) => (
              <div key={n} style={{display:'flex',justifyContent:'space-between',fontSize:12,padding:'4px 0',borderBottom:'0.5px solid var(--bdr)'}}>
                <span style={{fontWeight:500}}>{n}</span><span style={{color:'var(--t3)'}}>{d}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="ppipeline">
          <div style={{fontSize:13,fontWeight:500,marginBottom:8}}>Backend</div>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {[['Python Flask','REST API'],['SQLite + FAISS','databases'],['Scikit-learn','intent classifier'],['BERT NER','entity extraction'],['LangGraph','agent orchestration'],['Groq + Llama 3.1','AI summaries']].map(([n,d]) => (
              <div key={n} style={{display:'flex',justifyContent:'space-between',fontSize:12,padding:'4px 0',borderBottom:'0.5px solid var(--bdr)'}}>
                <span style={{fontWeight:500}}>{n}</span><span style={{color:'var(--t3)'}}>{d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ppipeline" style={{marginBottom:16}}>
        <div style={{fontSize:13,fontWeight:500,marginBottom:8}}>How It Works</div>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {[
            ['1. Search','User enters a product query (e.g., "iPhone 15 Pro")'],
            ['2. Classify','TF-IDF + SVM classifier identifies search intent'],
            ['3. Extract','BERT NER extracts product name, brand, category, target price'],
            ['4. Scrape','Scout agent scrapes all 4 platforms concurrently'],
            ['5. Retrieve','FAISS searches 6-month historical price data'],
            ['6. Score','Deal Quality Score computed (0-100) based on historical averages'],
            ['7. Generate','Llama 3.1 generates grounded summary via Groq API'],
            ['8. Display','Ranked deals with scores, charts, and AI summary shown to user'],
          ].map(([step, desc]) => (
            <div key={step} style={{display:'flex',gap:10,fontSize:12}}>
              <span style={{fontWeight:600,color:'var(--brand)',minWidth:80,fontFamily:'Space Mono'}}>{step}</span>
              <span style={{color:'var(--t2)'}}>{desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="ppipeline">
        <div style={{fontSize:13,fontWeight:500,marginBottom:8}}>Team Members</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {[{name:'Team Lead',role:'Full-Stack & AI Pipeline'},{name:'Member 2',role:'NLP & Web Scraping'},{name:'Member 3',role:'Frontend & UI/UX'},{name:'Member 4',role:'Database & RAG Pipeline'}].map(m => (
            <div key={m.name} style={{padding:10,borderRadius:'var(--rad)',background:'var(--bg2)',fontSize:12}}>
              <div style={{fontWeight:500}}>{m.name}</div>
              <div style={{color:'var(--t3)',fontSize:11,marginTop:2}}>{m.role}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
