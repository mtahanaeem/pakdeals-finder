import { useState } from 'react';
import { searchDeals, classifyQuery, extractEntities } from '../services/api';

export default function FlashSales({ darkMode }) {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const categories = [
    { name: 'Smartphones', query: 'smartphone phone', icon: '📱' },
    { name: 'Laptops', query: 'laptop notebook', icon: '💻' },
    { name: 'Audio', query: 'headphones earbuds speaker', icon: '🎧' },
    { name: 'Gaming', query: 'playstation ps5 gaming console', icon: '🎮' },
    { name: 'Tablets', query: 'ipad tablet', icon: '📟' },
    { name: 'TVs', query: 'tv television qled', icon: '📺' },
  ];

  const searchCategory = async (query) => {
    setLoading(true);
    setSearched(true);
    try {
      await classifyQuery(query);
      const extractRes = await extractEntities(query);
      const searchRes = await searchDeals(query, extractRes.data);
      const highDiscount = (searchRes.data.deals || []).filter(d => (d.discount_percent || 0) >= 15);
      setDeals(highDiscount);
    } catch (err) {
      setDeals([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{padding:16,maxWidth:960,margin:'0 auto'}}>
      <div className="ppipeline" style={{marginBottom:16}}>
        <div style={{fontSize:15,fontWeight:500,marginBottom:4}}>Flash Sales & Deals</div>
        <div style={{fontSize:11,color:'var(--t3)',marginBottom:16}}>Find products with the highest discounts across all platforms</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {categories.map(c => (
            <button key={c.name} className="deal-card" onClick={() => searchCategory(c.query)} style={{cursor:'pointer',textAlign:'center',padding:16}}>
              <div style={{fontSize:24,marginBottom:6}}>{c.icon}</div>
              <div style={{fontSize:12,fontWeight:500}}>{c.name}</div>
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="ppipeline" style={{textAlign:'center',padding:20}}>
          <div style={{fontSize:13,color:'var(--t3)'}}>Scanning platforms for flash deals...</div>
        </div>
      )}

      {!loading && searched && deals.length === 0 && (
        <div className="ppipeline" style={{textAlign:'center',padding:'30px 20px'}}>
          <div style={{fontSize:28,marginBottom:8,opacity:0.3}}>&#x26A1;</div>
          <div style={{fontSize:13,color:'var(--t3)'}}>No flash deals found with 15%+ discount</div>
        </div>
      )}

      {!loading && deals.length > 0 && (
        <div>
          <div style={{fontSize:14,fontWeight:500,marginBottom:12}}>Flash Deals Found ({deals.length})</div>
          <div className="deals-grid">
            {deals.map((deal, i) => (
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
                  {deal.original_price_pkr > deal.price_pkr && <span className="deal-original">PKR {deal.original_price_pkr?.toLocaleString()}</span>}
                  {deal.discount_percent > 0 && <span className="deal-discount">-{deal.discount_percent}%</span>}
                </div>
                <div className="deal-footer">
                  <div className="deal-rag"><div className="deal-rag-dot"/> Flash Deal</div>
                  <span className="deal-btn" style={{fontSize:11,background:'var(--bg2)',color:'var(--t2)',cursor:'default'}}>{deal.platform}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
