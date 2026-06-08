import { useState } from 'react';
import { classifyQuery, extractEntities, searchDeals } from '../services/api';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [deals, setDeals] = useState([]);
  const [summary, setSummary] = useState('');
  const [entities, setEntities] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [platformSummary, setPlatformSummary] = useState([]);

  const handleSearch = async (searchQuery) => {
    if (!searchQuery || !searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    setQuery(searchQuery);

    try {
      const classifyRes = await classifyQuery(searchQuery);
      const extractRes = await extractEntities(searchQuery);
      setEntities(extractRes.data);

      const searchRes = await searchDeals(searchQuery, extractRes.data);
      setDeals(searchRes.data.deals || []);
      setSummary(searchRes.data.summary || '');
      setMetrics(searchRes.data.metrics || null);
      setPlatformSummary(searchRes.data.platform_summary || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'An error occurred');
      setDeals([]);
      setSummary('');
      setMetrics(null);
      setPlatformSummary([]);
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setQuery('');
    setDeals([]);
    setSummary('');
    setEntities(null);
    setError(null);
    setMetrics(null);
    setPlatformSummary([]);
  };

  return {
    query, setQuery,
    deals, setDeals,
    summary, setSummary,
    entities, setEntities,
    loading, setLoading,
    error, setError,
    metrics, setMetrics,
    platformSummary, setPlatformSummary,
    handleSearch, resetSearch,
  };
}
