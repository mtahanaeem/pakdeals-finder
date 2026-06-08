import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement,
} from 'chart.js';
import SearchBar from '../components/SearchBar';
import AISummary from '../components/AISummary';
import PriceChart from '../components/PriceChart';
import { useSearch } from '../hooks/useSearch';
import { getStatus } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const PLATFORM_COLORS = { Daraz: '#E65100', Telemart: '#1565C0', iShopping: '#6A1B9A', Shophive: '#2E7D32' };

export default function Home({ darkMode }) {
  const { query, setQuery, deals, summary, entities, loading, error, handleSearch, metrics, platformSummary } = useSearch();
  const [pipelineStatus, setPipelineStatus] = useState({ status: 'idle', progress: 0, step: 0, steps: [] });
  const [activeSort, setActiveSort] = useState('score');
  const [maxPrice, setMaxPrice] = useState(200000);
  const [minScore, setMinScore] = useState(0);
  const [selectedPlatforms, setSelectedPlatforms] = useState({ Daraz: true, Telemart: true, iShopping: true, Shophive: true });
  const pollRef = useRef(null);

  useEffect(() => {
    if (loading) {
      pollRef.current = setInterval(async () => {
        try {
          const res = await getStatus();
          setPipelineStatus(res.data);
        } catch (e) {}
      }, 800);
    } else {
      if (pollRef.current) clearInterval(pollRef.current);
      if (deals.length > 0) {
        setPipelineStatus({ status: 'Complete', progress: 100, step: 6, steps: [
          { name: 'Classifier', desc: 'TF-IDF SVM', done: true },
          { name: 'NER', desc: 'entity extraction', done: true },
          { name: 'Scout Agent', desc: 'live scrape', done: true },
          { name: 'FAISS', desc: 'retrieve', done: true },
          { name: 'Analyze', desc: 'scoring', done: true },
          { name: 'Llama 3.1', desc: 'summary gen', done: true },
        ]});
      }
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [loading, deals.length]);

  const filteredDeals = deals
    .filter(d => selectedPlatforms[d.platform])
    .filter(d => d.price_pkr <= maxPrice)
    .filter(d => (d.deal_score || 0) >= minScore)
    .sort((a, b) => {
      if (activeSort === 'score') return (b.deal_score || 0) - (a.deal_score || 0);
      if (activeSort === 'price') return a.price_pkr - b.price_pkr;
      if (activeSort === 'discount') return (b.discount_percent || 0) - (a.discount_percent || 0);
      return 0;
    });

  const togglePlatform = (p) => setSelectedPlatforms(prev => ({ ...prev, [p]: !prev[p] }));

  const priceHistoryData = {};
  const scoreDistribution = { excellent: 0, good: 0, poor: 0 };
  deals.forEach(d => {
    const p = d.platform;
    if (!priceHistoryData[p]) priceHistoryData[p] = [];
    priceHistoryData[p].push({ price: d.price_pkr, date: new Date().toISOString().slice(0, 10) });
    const s = d.deal_score || 0;
    if (s >= 80) scoreDistribution.excellent++;
    else if (s >= 60) scoreDistribution.good++;
    else scoreDistribution.poor++;
  });

  const doughnutData = {
    labels: ['Excellent (80+)', 'Good (60-79)', 'Poor (<60)'],
    datasets: [{
      data: [scoreDistribution.excellent || 1, scoreDistribution.good || 0, scoreDistribution.poor || 0],
      backgroundColor: ['#3B6D11', '#185FA5', '#A32D2D'],
      borderWidth: 0, hoverOffset: 4,
    }],
  };

  return (
    <div className="pak-dash">
      <div className="psearch-wrap">
        <SearchBar query={query} setQuery={setQuery} onSearch={handleSearch} loading={loading} darkMode={darkMode} />
        <div className="psearch-chips">
          {['All Platforms', 'Daraz', 'Telemart', 'iShopping', 'Shophive'].map(p => (
            <button key={p} className={`pchip ${p === 'All Platforms' ? 'active' : ''}`}
              onClick={() => {
                if (p === 'All Platforms') setSelectedPlatforms({ Daraz: true, Telemart: true, iShopping: true, Shophive: true });
                else togglePlatform(p);
              }}>{p}</button>
          ))}
        </div>
      </div>

      <div className="pmain">
        <aside className="pside">
          <div className="pside-section">
            <div className="pside-label">Navigation</div>
            <Link to="/" className="pside-item active" style={{textDecoration:'none'}}>
              <span>&#x1F4E6;</span> Live Deals <span className="pside-count">{deals.length || '—'}</span>
            </Link>
            <Link to="/history" className="pside-item" style={{textDecoration:'none'}}>
              <span>&#x1F4C8;</span> Price History
            </Link>
            <Link to="/flash-sales" className="pside-item" style={{textDecoration:'none'}}>
              <span>&#x26A1;</span> Flash Sales
            </Link>
            <Link to="/alerts" className="pside-item" style={{textDecoration:'none'}}>
              <span>&#x1F514;</span> Alerts
            </Link>
            <Link to="/pipeline" className="pside-item" style={{textDecoration:'none'}}>
              <span>&#x2699;</span> RAG Pipeline
            </Link>
          </div>
          <div className="pside-section">
            <div className="pside-label">Platforms</div>
            {Object.keys(selectedPlatforms).map(p => (
              <label key={p} className="pside-plat">
                <input type="checkbox" checked={selectedPlatforms[p]} onChange={() => togglePlatform(p)} /> {p}.pk
              </label>
            ))}
          </div>
          <div className="pside-section">
            <div className="pside-label">Price Range (PKR)</div>
            <div className="pside-range">
              <input type="range" min="0" max="500000" value={maxPrice} onChange={e => setMaxPrice(parseInt(e.target.value))} />
              <div className="pside-rvals"><span>0</span><span>{maxPrice.toLocaleString()}</span></div>
            </div>
          </div>
          <div className="pside-section">
            <div className="pside-label">Min Deal Score</div>
            <div className="pside-range">
              <input type="range" min="0" max="100" value={minScore} onChange={e => setMinScore(parseInt(e.target.value))} />
              <div className="pside-rvals"><span>0</span><span>{minScore}+</span></div>
            </div>
          </div>
          <div className="pside-section">
            <div className="pside-label">Score Legend</div>
            <div style={{padding:'0 8px',display:'flex',flexDirection:'column',gap:'4px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'11px'}}><div style={{width:10,height:10,borderRadius:'50%',background:'#639922',flexShrink:0}}/><span style={{color:'var(--t2)'}}>80–100 Excellent</span></div>
              <div style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'11px'}}><div style={{width:10,height:10,borderRadius:'50%',background:'var(--blue)',flexShrink:0}}/><span style={{color:'var(--t2)'}}>60–79 Good</span></div>
              <div style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'11px'}}><div style={{width:10,height:10,borderRadius:'50%',background:'var(--red)',flexShrink:0}}/><span style={{color:'var(--t2)'}}>0–59 Poor</span></div>
            </div>
          </div>
        </aside>

        <main className="pcontent">
          {/* Pipeline Status */}
          <div className="ppipeline">
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{fontSize:13,fontWeight:500}}>RAG Pipeline Status</div>
              <div style={{fontSize:11,color:'var(--t3)'}}>{pipelineStatus.status === 'idle' ? 'Awaiting first search' : pipelineStatus.status}</div>
            </div>
            <div className="prog-bar"><div className="prog-fill" style={{width:`${pipelineStatus.progress}%`}}/></div>
            <div className="ppipe-steps" style={{marginTop:14}}>
              {(pipelineStatus.steps.length ? pipelineStatus.steps : [
                {name:'Classifier',desc:'TF-IDF SVM',done:false},
                {name:'NER',desc:'entity extraction',done:false},
                {name:'Scout Agent',desc:'live scrape',done:false},
                {name:'FAISS',desc:'retrieve',done:false},
                {name:'Analyze',desc:'scoring',done:false},
                {name:'Llama 3.1',desc:'summary gen',done:false},
              ]).map((s,i) => (
                <div className="ppipe-step" key={i}>
                  <div className={`ppipe-icon ${s.done ? 'ppipe-done' : (pipelineStatus.step === i+1 && loading) ? 'ppipe-active' : 'ppipe-idle'}`}>
                    {s.done ? '✓' : '—'}
                  </div>
                  <div className="ppipe-lbl">{s.name}</div>
                  <div className="ppipe-sublbl">{s.desc}</div>
                </div>
              ))}
            </div>
            {entities && (
              <div className="ner-tags" style={{marginTop:12,paddingTop:12,borderTop:'0.5px solid var(--bdr)'}}>
                {entities.product_name && <span className="ner-tag" style={{background:'var(--brand-light)',color:'var(--brand)'}}><span className="ner-key">PRODUCT</span> {entities.product_name}</span>}
                {entities.brand && <span className="ner-tag" style={{background:'var(--blue-light)',color:'var(--blue)'}}><span className="ner-key">BRAND</span> {entities.brand}</span>}
                {entities.category && <span className="ner-tag" style={{background:'var(--accent-light)',color:'var(--accent)'}}><span className="ner-key">CATEGORY</span> {entities.category}</span>}
                {entities.platform && <span className="ner-tag" style={{background:'var(--red-light)',color:'var(--red)'}}><span className="ner-key">PLATFORM</span> {entities.platform}</span>}
                {entities.target_price && <span className="ner-tag" style={{background:'var(--bg2)',color:'var(--t2)'}}><span className="ner-key">TARGET</span> PKR {entities.target_price.toLocaleString()}</span>}
              </div>
            )}
          </div>

          {/* Metrics */}
          <div className="pmetrics">
            <div className="pmetric">
              <div className="pmetric-label">Deals Found</div>
              <div className="pmetric-val">{metrics ? metrics.total_deals : '—'}</div>
              <div className="pmetric-sub">across platforms</div>
              <span className={`pmetric-badge ${metrics ? 'badge-green' : 'badge-blue'}`}>{metrics ? 'live data' : 'awaiting scrape'}</span>
              <div className="pmetric-accent" style={{width: metrics ? '100%' : '10%', background:'#1D9E75'}}/>
            </div>
            <div className="pmetric">
              <div className="pmetric-label">Best Price</div>
              <div className="pmetric-val" style={{fontSize:16}}>{metrics && metrics.best_price ? `PKR ${metrics.best_price.toLocaleString()}` : '—'}</div>
              <div className="pmetric-sub">{metrics ? 'lowest found' : 'awaiting data'}</div>
              <span className={`pmetric-badge ${metrics ? 'badge-green' : 'badge-blue'}`}>{metrics ? 'live data' : 'awaiting data'}</span>
              <div className="pmetric-accent" style={{width: metrics ? '100%' : '10%', background:'#639922'}}/>
            </div>
            <div className="pmetric">
              <div className="pmetric-label">Avg Historical Price</div>
              <div className="pmetric-val" style={{fontSize:16}}>{metrics && metrics.avg_price ? `PKR ${metrics.avg_price.toLocaleString()}` : '—'}</div>
              <div className="pmetric-sub">{metrics ? 'RAG retrieved' : 'live only'}</div>
              <span className={`pmetric-badge ${metrics ? 'badge-amber' : 'badge-blue'}`}>{metrics ? '6-month data' : 'live only'}</span>
              <div className="pmetric-accent" style={{width: metrics ? '100%' : '10%', background:'var(--blue)'}}/>
            </div>
            <div className="pmetric">
              <div className="pmetric-label">Fake Sales Detected</div>
              <div className="pmetric-val">{metrics ? metrics.fake_sales : '—'}</div>
              <div className="pmetric-sub">score &lt; 60 · inflated</div>
              <span className={`pmetric-badge ${metrics && metrics.fake_sales > 0 ? 'badge-red' : 'badge-blue'}`}>{metrics ? (metrics.fake_sales > 0 ? 'warning' : 'clean') : 'live only'}</span>
              <div className="pmetric-accent" style={{width: metrics ? '100%' : '10%', background:'var(--red)'}}/>
            </div>
          </div>

          {/* AI Summary */}
          <AISummary summary={summary} darkMode={darkMode} />

          {/* Charts */}
          {deals.length > 0 && (
            <div className="pcharts-row">
              <div className="pchart-card">
                <div className="pchart-title">Price History</div>
                <div className="pchart-sub">Data sourced from live scraping + RAG retrieval</div>
                <PriceChart productId={entities?.product_name || query} darkMode={darkMode} />
              </div>
              <div className="pchart-card">
                <div className="pchart-title">Deal Score Distribution</div>
                <div className="pchart-sub">{deals.length} deals analyzed</div>
                <div style={{position:'relative',width:'100%',height:200}}>
                  <Doughnut data={doughnutData} options={{responsive:true,maintainAspectRatio:false,cutout:'65%',plugins:{legend:{position:'bottom',labels:{font:{size:10},usePointStyle:true,padding:8}},tooltip:{callbacks:{label:(ctx)=>`${ctx.label}: ${ctx.raw} deals`}}}}}/>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div style={{background:'var(--red-light)',border:'0.5px solid var(--red)',borderRadius:'var(--radl)',padding:'12px 14px',marginBottom:16,fontSize:13,color:'var(--red)'}}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Deals Grid Header */}
          <div className="pgrid-header">
            <div className="pgrid-title">Live Deal Cards <span style={{color:'var(--t3)',fontWeight:400,fontSize:12}}>· {filteredDeals.length} results · sorted by {activeSort}</span></div>
            <div className="pgrid-sort">
              {[['score','Score ↓'],['price','Price ↑'],['discount','Discount']].map(([key,label]) => (
                <button key={key} className={`pgrid-sortbtn ${activeSort===key?'active':''}`} onClick={()=>setActiveSort(key)}>{label}</button>
              ))}
            </div>
          </div>

          {/* Deals Grid */}
          <div className="deals-grid">
            {loading && [1,2,3].map(i => (
              <div key={i} className="deal-card" style={{opacity:0.5}}>
                <div style={{height:16,width:80,background:'var(--bg2)',borderRadius:4,marginBottom:10}}/>
                <div style={{height:14,width:'100%',background:'var(--bg2)',borderRadius:4,marginBottom:6}}/>
                <div style={{height:14,width:'70%',background:'var(--bg2)',borderRadius:4,marginBottom:10}}/>
                <div style={{height:20,width:120,background:'var(--bg2)',borderRadius:4}}/>
              </div>
            ))}
            {!loading && filteredDeals.length === 0 && (
              <div style={{gridColumn:'1/-1',textAlign:'center',padding:'40px 20px',color:'var(--t3)',fontSize:14}}>
                <div style={{fontSize:32,marginBottom:12,opacity:0.3}}>&#x26A1;</div>
                <div>{deals.length === 0 ? 'No deals yet' : 'No deals match your filters'}</div>
                <div style={{fontSize:12,marginTop:4}}>{deals.length === 0 ? 'Use the search bar to scrape live deals from platforms' : 'Adjust price range or score filters'}</div>
              </div>
            )}
            {!loading && filteredDeals.map((deal, i) => (
              <div className="deal-card" key={i}>
                <div className="deal-card-accent" style={{background: deal.platform === 'Daraz' ? '#E65100' : deal.platform === 'Telemart' ? '#1565C0' : deal.platform === 'iShopping' ? '#6A1B9A' : '#2E7D32'}}/>
                <div className="deal-card-header">
                  <span className={`deal-plat plat-${deal.platform.toLowerCase()}`}>{deal.platform}</span>
                  <div className={`deal-score ${(deal.deal_score||0) >= 80 ? 'score-ex' : (deal.deal_score||0) >= 60 ? 'score-good' : 'score-poor'}`}>
                    {deal.deal_score || '—'}
                  </div>
                </div>
                <div className="deal-name">{deal.title}</div>
                <div className="deal-price-row">
                  <span className="deal-price">PKR {deal.price_pkr?.toLocaleString()}</span>
                  {deal.original_price_pkr && deal.original_price_pkr > deal.price_pkr && (
                    <span className="deal-original">PKR {deal.original_price_pkr?.toLocaleString()}</span>
                  )}
                  {deal.discount_percent > 0 && <span className="deal-discount">-{deal.discount_percent}%</span>}
                </div>
                <div className="deal-footer">
                  <div className="deal-rag"><div className="deal-rag-dot"/> RAG Score</div>
                  <span className="deal-btn" style={{fontSize:11,background:'var(--bg2)',color:'var(--t2)',cursor:'default'}}>{deal.platform}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Platform Table */}
          {platformSummary.length > 0 && (
            <div className="pchart-card" style={{marginBottom:16}}>
              <div className="pchart-title">Platform Scrape Summary</div>
              <div className="pchart-sub">Scout Agent scrapes live on each search</div>
              <table className="ptable">
                <thead><tr><th>Platform</th><th>Listings</th><th>Avg Price (PKR)</th><th>Best Score</th><th>Status</th></tr></thead>
                <tbody>
                  {platformSummary.map((p,i) => (
                    <tr key={i}>
                      <td>{p.platform}</td>
                      <td>{p.listings}</td>
                      <td>PKR {p.avg_price?.toLocaleString()}</td>
                      <td>{p.best_score}</td>
                      <td><span className={`pmetric-badge ${p.best_score >= 80 ? 'badge-green' : p.best_score >= 60 ? 'badge-blue' : 'badge-red'}`}>{p.best_score >= 80 ? 'Excellent' : p.best_score >= 60 ? 'Good' : 'Poor'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
