import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Compare from './pages/Compare';
import About from './pages/About';
import PriceHistory from './pages/PriceHistory';
import FlashSales from './pages/FlashSales';
import Alerts from './pages/Alerts';
import Pipeline from './pages/Pipeline';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('pakdeals-dark-mode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('pakdeals-dark-mode', JSON.stringify(darkMode));
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <Router>
      <div className="pak-dash">
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
        <Routes>
          <Route path="/" element={<Home darkMode={darkMode} />} />
          <Route path="/compare" element={<Compare darkMode={darkMode} />} />
          <Route path="/about" element={<About darkMode={darkMode} />} />
          <Route path="/history" element={<PriceHistory darkMode={darkMode} />} />
          <Route path="/flash-sales" element={<FlashSales darkMode={darkMode} />} />
          <Route path="/alerts" element={<Alerts darkMode={darkMode} />} />
          <Route path="/pipeline" element={<Pipeline darkMode={darkMode} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
