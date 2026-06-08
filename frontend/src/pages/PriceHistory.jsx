import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { getPriceHistory } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const PLATFORM_COLORS = { Daraz: '#E65100', Telemart: '#1565C0', iShopping: '#6A1B9A', Shophive: '#2E7D32' };

export default function PriceHistory({ darkMode }) {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const res = await getPriceHistory(query);
      setHistory(res.data.history || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const platforms = [...new Set(history.map(h => h.platform))];
  const dates = [...new Set(history.map(h => h.date))].sort();

  const chartData = {
    labels: dates.map(d => { const [,m,day] = d.split('-'); const ms = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; return `${ms[parseInt(m)]} ${day}`; }),
    datasets: platforms.map(p => ({
      label: p,
      data: dates.map(d => { const r = history.find(h => h.platform === p && h.date === d); return r ? r.price_pkr : null; }),
      borderColor: PLATFORM_COLORS[p] || '#6b7280',
      backgroundColor: (PLATFORM_COLORS[p] || '#6b7280') + '20',
      tension: 0.3, fill: false, pointRadius: 3,
    })),
  };

  const stats = platforms.map(p => {
    const prices = history.filter(h => h.platform === p).map(h => h.price_pkr);
    return { platform: p, avg: Math.round(prices.reduce((a,b)=>a+b,0)/prices.length), min: Math.min(...prices), max: Math.max(...prices), count: prices.length };
  });

  return (
    <div style={{padding:16,maxWidth:960,margin:'0 auto'}}>
      <div className="ppipeline" style={{marginBottom:16}}>
        <div style={{fontSize:15,fontWeight:500,marginBottom:4}}>Price History</div>
        <div style={{fontSize:11,color:'var(--t3)',marginBottom:12}}>View 6-month price trends for any product across all platforms</div>
        <div style={{display:'flex',gap:8}}>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g., iPhone 15 Pro"
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            style={{flex:1,padding:'8px 12px',borderRadius:'var(--rad)',border:'0.5px solid var(--bdr2)',background:'var(--bg2)',color:'var(--t1)',fontSize:13,fontFamily:'DM Sans',outline:'none'}} />
          <button className="psearch-btn" onClick={handleSearch} disabled={loading || !query.trim()}>
            {loading ? 'Loading...' : 'View History'}
          </button>
        </div>
      </div>

      {error && <div className="ppipeline" style={{borderColor:'var(--red)',marginBottom:16}}><div style={{color:'var(--red)',fontSize:12}}>{error}</div></div>}

      {!searched && (
        <div className="ppipeline" style={{textAlign:'center',padding:'40px 20px'}}>
          <div style={{fontSize:32,marginBottom:8,opacity:0.3}}>&#x1F4C8;</div>
          <div style={{fontSize:13,color:'var(--t3)'}}>Search for a product to view its 6-month price history</div>
        </div>
      )}

      {searched && history.length === 0 && !loading && (
        <div className="ppipeline" style={{textAlign:'center',padding:'40px 20px'}}>
          <div style={{fontSize:32,marginBottom:8,opacity:0.3}}>&#x1F4C9;</div>
          <div style={{fontSize:13,color:'var(--t3)'}}>No price history found for this product</div>
        </div>
      )}

      {history.length > 0 && (
        <>
          <div className="pchart-card" style={{marginBottom:16}}>
            <div className="pchart-title">Price Trend — {query}</div>
            <div className="pchart-sub">{history.length} records across {platforms.length} platforms</div>
            <div style={{position:'relative',width:'100%',height:280}}>
              <Line data={chartData} options={{responsive:true,maintainAspectRatio:false,
                plugins:{legend:{position:'bottom',labels:{font:{size:10},usePointStyle:true,padding:8}}},
                scales:{y:{ticks:{font:{size:10},callback:v=>`PKR ${(v/1000).toFixed(0)}K`},grid:{color:'rgba(0,0,0,0.04)'}},x:{ticks:{font:{size:10}},grid:{display:false}}}}}/>
            </div>
          </div>

          <div className="pchart-card">
            <div className="pchart-title">Platform Price Comparison</div>
            <table className="ptable">
              <thead><tr><th>Platform</th><th>Avg Price</th><th>Lowest</th><th>Highest</th><th>Records</th></tr></thead>
              <tbody>
                {stats.sort((a,b)=>a.avg-b.avg).map((s,i) => (
                  <tr key={i}>
                    <td style={{fontWeight:500}}>{s.platform}</td>
                    <td style={{fontFamily:'Space Mono'}}>PKR {s.avg.toLocaleString()}</td>
                    <td style={{fontFamily:'Space Mono',color:'#3B6D11'}}>PKR {s.min.toLocaleString()}</td>
                    <td style={{fontFamily:'Space Mono',color:'var(--red)'}}>PKR {s.max.toLocaleString()}</td>
                    <td>{s.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
