import { useState, useEffect } from 'react';
import { getPriceHistory } from '../services/api';

export function usePriceHistory(productId) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) return;

    const fetchHistory = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getPriceHistory(productId);
        setHistory(res.data.history || []);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [productId]);

  return { history, loading, error };
}
