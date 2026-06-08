import { useState } from 'react';

export default function SearchBar({ query, setQuery, onSearch, loading, darkMode }) {
  const [localQuery, setLocalQuery] = useState(query || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (localQuery.trim()) onSearch(localQuery.trim());
  };

  const handleChange = (e) => {
    setLocalQuery(e.target.value);
    setQuery(e.target.value);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="psearch-bar">
        <span style={{fontSize:18,color:'var(--t3)'}}>&#x1F50D;</span>
        <input type="text" value={localQuery} onChange={handleChange}
          placeholder="Search for products (e.g., laptop, phone, TV)"
          disabled={loading} />
        <button type="submit" className="psearch-btn" disabled={loading || !localQuery.trim()}>
          {loading ? 'Searching...' : 'Search Deals'}
        </button>
      </form>
      <div className="psearch-chips">
        {['iPhone 15 Pro', 'Samsung S24 Ultra', 'MacBook Air M2', 'PS5 Console', 'Sony WH-1000XM5'].map(s => (
          <button key={s} className="pchip" onClick={() => { setLocalQuery(s); setQuery(s); onSearch(s); }}>{s}</button>
        ))}
      </div>
    </div>
  );
}
