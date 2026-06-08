import { useState } from 'react';
import { searchDeals, classifyQuery, extractEntities } from '../services/api';

export default function Alerts({ darkMode }) {
  const [alerts, setAlerts] = useState([]);
  const [query, setQuery] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [loading, setLoading] = useState(false);

  const addAlert = async () => {
    if (!query.trim() || !targetPrice) return;
    setLoading(true);
    try {
      await classifyQuery(query);
      const extractRes = await extractEntities(query);
      const searchRes = await searchDeals(query, extractRes.data);
      const deals = searchRes.data.deals || [];
      const target = parseInt(targetPrice);
      const triggered = deals.filter(d => d.price_pkr <= target);
      setAlerts(prev => [...prev, {
        query, targetPrice: target, date: new Date().toLocaleDateString(),
        totalDeals: deals.length, triggered: triggered.length,
        bestPrice: deals.length > 0 ? Math.min(...deals.map(d => d.price_pkr)) : 0,
        deals: triggered,
      }]);
      setQuery('');
      setTargetPrice('');
    } catch (err) {
      setAlerts(prev => [...prev, { query, targetPrice: parseInt(targetPrice), date: new Date().toLocaleDateString(), totalDeals: 0, triggered: 0, bestPrice: 0, error: err.message, deals: [] }]);
      setQuery('');
      setTargetPrice('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{padding:16,maxWidth:960,margin:'0 auto'}}>
      <div className="ppipeline" style={{marginBottom:16}}>
        <div style={{fontSize:15,fontWeight:500,marginBottom:4}}>Price Alerts</div>
        <div style={{fontSize:11,color:'var(--t3)',marginBottom:12}}>Set target prices and get notified when deals match</div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Product name"
            style={{flex:1,minWidth:200,padding:'8px 12px',borderRadius:'var(--rad)',border:'0.5px solid var(--bdr2)',background:'var(--bg2)',color:'var(--t1)',fontSize:13,fontFamily:'DM Sans',outline:'none'}} />
          <input value={targetPrice} onChange={e => setTargetPrice(e.target.value)} placeholder="Target price (PKR)" type="number"
            style={{width:160,padding:'8px 12px',borderRadius:'var(--rad)',border:'0.5px solid var(--bdr2)',background:'var(--bg2)',color:'var(--t1)',fontSize:13,fontFamily:'DM Sans',outline:'none'}} />
          <button className="psearch-btn" onClick={addAlert} disabled={loading || !query.trim() || !targetPrice}>
            {loading ? 'Checking...' : 'Set Alert'}
          </button>
        </div>
      </div>

      {alerts.length === 0 && (
        <div className="ppipeline" style={{textAlign:'center',padding:'40px 20px'}}>
          <div style={{fontSize:32,marginBottom:8,opacity:0.3}}>&#x1F514;</div>
          <div style={{fontSize:13,color:'var(--t3)'}}>No alerts set yet. Add a product and target price above.</div>
        </div>
      )}

      {alerts.map((a, i) => (
        <div key={i} className="ppipeline" style={{marginBottom:12,borderColor: a.triggered > 0 ? 'var(--brand)' : a.error ? 'var(--red)' : 'var(--bdr)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
            <div>
              <div style={{fontSize:13,fontWeight:500}}>{a.query}</div>
              <div style={{fontSize:11,color:'var(--t3)'}}>Target: PKR {a.targetPrice.toLocaleString()} · Checked: {a.date}</div>
            </div>
            <span className={`pmetric-badge ${a.triggered > 0 ? 'badge-green' : a.error ? 'badge-red' : 'badge-blue'}`}>
              {a.error ? 'Error' : a.triggered > 0 ? `${a.triggered} Triggered!` : 'No Match'}
            </span>
          </div>
          <div style={{display:'flex',gap:16,fontSize:12,color:'var(--t2)'}}>
            <span>Deals Found: <strong>{a.totalDeals}</strong></span>
            <span>Best Price: <strong style={{color:'var(--brand)'}}>PKR {a.bestPrice.toLocaleString()}</strong></span>
            {a.bestPrice <= a.targetPrice && <span style={{color:'#3B6D11',fontWeight:500}}>&#x2713; Below target!</span>}
          </div>
          {a.deals && a.deals.length > 0 && (
            <div style={{marginTop:10,paddingTop:10,borderTop:'0.5px solid var(--bdr)'}}>
              <div style={{fontSize:11,fontWeight:500,marginBottom:6}}>Matching Deals:</div>
              {a.deals.map((d,j) => (
                <div key={j} style={{display:'flex',justifyContent:'space-between',fontSize:12,padding:'4px 0',borderBottom:'0.5px solid var(--bdr)'}}>
                  <span>{d.platform}: {d.title?.substring(0,40)}</span>
                  <span style={{fontFamily:'Space Mono',color:'var(--brand)',fontWeight:600}}>PKR {d.price_pkr?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
