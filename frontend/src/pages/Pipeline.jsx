import { useState, useEffect } from 'react';
import { getStatus } from '../services/api';

const PIPELINE_INFO = [
  { name: 'Intent Classifier', tech: 'TF-IDF + SVM', desc: 'Classifies user queries into product_search, price_comparison, category_browse, or deal_alert using a trained SVM classifier with 348 training samples.', icon: '&#x1F4DD;' },
  { name: 'Entity Extraction', tech: 'BERT NER + Regex', desc: 'Extracts product name, brand, category, target price, and platform from queries using BERT-large fine-tuned on CoNLL-03, with regex fallback for PKR prices.', icon: '&#x1F50E;' },
  { name: 'Scout Agent', tech: 'BeautifulSoup + ThreadPool', desc: 'Scrapes 4 Pakistani e-commerce platforms concurrently using ThreadPoolExecutor. Returns realistic mock data when live scraping is blocked.', icon: '&#x1F9ED;' },
  { name: 'FAISS Retriever', tech: 'Sentence-Transformers + FAISS', desc: 'Encodes products with all-MiniLM-L6-v2 and indexes in FAISS. Retrieves similar historical records for price comparison and deal scoring.', icon: '&#x1F4E1;' },
  { name: 'Deal Analyzer', tech: 'RAG Augmentation', desc: 'Computes Deal Quality Score (0-100) by comparing current price against 6-month historical average. Builds augmented prompts for the LLM.', icon: '&#x1F4CA;' },
  { name: 'Summary Generator', tech: 'Llama 3.1 via Groq', desc: 'Generates 3-4 sentence grounded summaries using Llama 3.1-8B-instant via Groq API. Falls back to rule-based summaries if API is unavailable.', icon: '&#x1F916;' },
];

export default function Pipeline({ darkMode }) {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try { const res = await getStatus(); setStatus(res.data); } catch (e) {}
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{padding:16,maxWidth:960,margin:'0 auto'}}>
      <div className="ppipeline" style={{marginBottom:16}}>
        <div style={{fontSize:15,fontWeight:500,marginBottom:4}}>RAG Pipeline Architecture</div>
        <div style={{fontSize:11,color:'var(--t3)',marginBottom:12}}>Multi-agent pipeline with LangGraph orchestration, FAISS retrieval, and Groq LLM</div>

        <div className="prog-bar" style={{marginBottom:16}}>
          <div className="prog-fill" style={{width:`${status?.progress || 0}%`}}/>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:16}}>
          <div className="pmetric"><div className="pmetric-label">Pipeline Status</div><div className="pmetric-val" style={{fontSize:14}}>{status?.status || 'Idle'}</div></div>
          <div className="pmetric"><div className="pmetric-label">Current Step</div><div className="pmetric-val" style={{fontSize:14}}>{status?.step ? `${status.step}/6` : '0/6'}</div></div>
          <div className="pmetric"><div className="pmetric-label">Progress</div><div className="pmetric-val" style={{fontSize:14}}>{status?.progress || 0}%</div></div>
        </div>

        <div className="ppipe-steps">
          {(status?.steps || [
            {name:'Classifier',desc:'TF-IDF SVM',done:false},
            {name:'NER',desc:'entity extraction',done:false},
            {name:'Scout Agent',desc:'live scrape',done:false},
            {name:'FAISS',desc:'retrieve',done:false},
            {name:'Analyze',desc:'scoring',done:false},
            {name:'Llama 3.1',desc:'summary gen',done:false},
          ]).map((s,i) => (
            <div className="ppipe-step" key={i}>
              <div className={`ppipe-icon ${s.done ? 'ppipe-done' : 'ppipe-idle'}`}>{s.done ? '✓' : (i+1)}</div>
              <div className="ppipe-lbl">{s.name}</div>
              <div className="ppipe-sublbl">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {PIPELINE_INFO.map((p, i) => (
        <div key={i} className="ppipeline" style={{marginBottom:12}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
            <div className={`ppipe-icon ${(status?.steps || [])[i]?.done ? 'ppipe-done' : 'ppipe-idle'}`} style={{width:36,height:36,fontSize:16}} dangerouslySetInnerHTML={{__html: p.icon}}/>
            <div>
              <div style={{fontSize:13,fontWeight:500}}>{p.name}</div>
              <div style={{fontSize:11,color:'var(--brand)',fontFamily:'Space Mono'}}>{p.tech}</div>
            </div>
            <div style={{marginLeft:'auto'}}>
              <span className={`pmetric-badge ${(status?.steps || [])[i]?.done ? 'badge-green' : 'badge-blue'}`}>
                {(status?.steps || [])[i]?.done ? 'Ready' : 'Standby'}
              </span>
            </div>
          </div>
          <div style={{fontSize:12,color:'var(--t2)',lineHeight:1.6,paddingLeft:46}}>{p.desc}</div>
        </div>
      ))}
    </div>
  );
}
