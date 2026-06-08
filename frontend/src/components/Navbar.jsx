import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ darkMode, setDarkMode }) {
  const location = useLocation();

  const links = [
    { path: '/', label: 'Deals' },
    { path: '/compare', label: 'Compare' },
    { path: '/history', label: 'History' },
    { path: '/flash-sales', label: 'Flash Sales' },
    { path: '/alerts', label: 'Alerts' },
    { path: '/about', label: 'About' },
  ];

  return (
    <nav className="pnav">
      <div className="pnav-logo">
        <div className="pnav-logo-dot" />
        PakDeals Finder
      </div>
      <div className="pnav-links">
        {links.map(l => (
          <Link key={l.path} to={l.path}
            className={`pnav-link ${location.pathname === l.path ? 'active' : ''}`}>
            {l.label}
          </Link>
        ))}
      </div>
      <div className="pnav-right">
        <div className="pnav-status"><div className="pnav-status-dot" /> RAG Live</div>
        <span className="pnav-badge">Llama 3.1 · FAISS</span>
        <button className="pnav-theme" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? '☀' : '☾'}
        </button>
      </div>
    </nav>
  );
}
