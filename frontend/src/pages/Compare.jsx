import { useState } from 'react';
import { classifyQuery, extractEntities, searchDeals } from '../services/api';

export default function Compare({ darkMode }) {
  const [query1, setQuery1] = useState('');
  const [query2, setQuery2] = useState('');
  const [deals1, setDeals1] = useState([]);
  const [deals2, setDeals2] = useState([]);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [error, setError] = useState(null);

  const searchProduct = async (query, setDeals, setLoading) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await classifyQuery(query);
      const extractRes = await extractEntities(query);
      const searchRes = await searchDeals(query, extractRes.data);
      setDeals(searchRes.data.deals || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setDeals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = () => {
    searchProduct(query1, setDeals1, setLoading1);
    searchProduct(query2, setDeals2, setLoading2);
  };

  const best1 = deals1.length > 0 ? deals1.reduce((b, d) => (d.deal_score || 0) > (b.deal_score || 0) ? d : b, deals1[0]) : null;
  const best2 = deals2.length > 0 ? deals2.reduce((b, d) => (d.deal_score || 0) > (b.deal_score || 0) ? d : b, deals2[0]) : null;

  return (
    <div style={{padding:16,maxWidth:960,margin:'0 auto'}}>
      <div className="ppipeline" style={{marginBottom:16}}>
        <div style={{fontSize:15,fontWeight:500,marginBottom:4}}>Compare Products</div>
        <div style={{fontSize:11,color:'var(--t3)',marginBottom:16}}>Search two products to compare prices, scores, and deals side by side</div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
          <div>
            <label style={{fontSize:11,color:'var(--t3)',marginBottom:4,display:'block'}}>Product 1</label>
            <div style={{display:'flex',gap:8}}>
              <input value={query1} onChange={e => setQuery1(e.target.value)} placeholder="e.g., iPhone 15 Pro"
                style={{flex:1,padding:'8px 12px',borderRadius:'var(--rad)',border:'0.5px solid var(--bdr2)',background:'var(--bg2)',color:'var(--t1)',fontSize:13,fontFamily:'DM Sans',outline:'none'}} />
              <button className="psearch-btn" onClick={() => searchProduct(query1, setDeals1, setLoading1)} disabled={loading1 || !query1.trim()}>
                {loading1 ? '...' : 'Search'}
              </button>
            </div>
          </div>
          <div>
            <label style={{fontSize:11,color:'var(--t3)',marginBottom:4,display:'block'}}>Product 2</label>
            <div style={{display:'flex',gap:8}}>
              <input value={query2} onChange={e => setQuery2(e.target.value)} placeholder="e.g., Samsung Galaxy S24"
                style={{flex:1,padding:'8px 12px',borderRadius:'var(--rad)',border:'0.5px solid var(--bdr2)',background:'var(--bg2)',color:'var(--t1)',fontSize:13,fontFamily:'DM Sans',outline:'none'}} />
              <button className="psearch-btn" onClick={() => searchProduct(query2, setDeals2, setLoading2)} disabled={loading2 || !query2.trim()}>
                {loading2 ? '...' : 'Search'}
              </button>
            </div>
          </div>
        </div>

        <div style={{textAlign:'center'}}>
          <button className="psearch-btn" onClick={handleCompare} disabled={loading1 || loading2 || !query1.trim() || !query2.trim()}
            style={{padding:'8px 24px'}}>
            {loading1 || loading2 ? 'Comparing...' : 'Compare Now'}
          </button>
        </div>

        {error && <div style={{marginTop:12,padding:10,borderRadius:'var(--rad)',background:'var(--red-light)',color:'var(--red)',fontSize:12}}>{error}</div>}
      </div>

      {best1 && best2 && (
        <div className="ppipeline">
          <div style={{fontSize:14,fontWeight:500,marginBottom:12}}>Comparison Results</div>
          <table className="ptable">
            <thead><tr><th>Feature</th><th>{query1}</th><th>{query2}</th></tr></thead>
            <tbody>
              <tr><td style={{fontWeight:500}}>Best Deal Price</td>
                <td style={{fontFamily:'Space Mono',fontWeight:600,color:'var(--brand)'}}>PKR {best1.price_pkr?.toLocaleString()}</td>
                <td style={{fontFamily:'Space Mono',fontWeight:600,color:'var(--brand)'}}>PKR {best2.price_pkr?.toLocaleString()}</td></tr>
              <tr><td style={{fontWeight:500}}>Deal Score</td>
                <td><span className={`pmetric-badge ${(best1.deal_score||0)>=80?'badge-green':(best1.deal_score||0)>=60?'badge-blue':'badge-red'}`}>{best1.deal_score}</span></td>
                <td><span className={`pmetric-badge ${(best2.deal_score||0)>=80?'badge-green':(best2.deal_score||0)>=60?'badge-blue':'badge-red'}`}>{best2.deal_score}</span></td></tr>
              <tr><td style={{fontWeight:500}}>Platform</td><td>{best1.platform}</td><td>{best2.platform}</td></tr>
              <tr><td style={{fontWeight:500}}>Discount</td>
                <td style={{color:'#3B6D11',fontWeight:500}}>{best1.discount_percent ? `-${best1.discount_percent}%` : 'N/A'}</td>
                <td style={{color:'#3B6D11',fontWeight:500}}>{best2.discount_percent ? `-${best2.discount_percent}%` : 'N/A'}</td></tr>
              <tr><td style={{fontWeight:500}}>Total Deals</td><td>{deals1.length}</td><td>{deals2.length}</td></tr>
              <tr><td style={{fontWeight:500}}>Winner</td>
                <td colSpan={2} style={{fontWeight:600,color:'var(--brand)',textAlign:'center'}}>
                  {(best1.deal_score||0) > (best2.deal_score||0) ? `${query1} wins` : (best2.deal_score||0) > (best1.deal_score||0) ? `${query2} wins` : 'Tie - both offer similar value'}
                </td></tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
