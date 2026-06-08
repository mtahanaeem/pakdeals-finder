import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { usePriceHistory } from '../hooks/usePriceHistory';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const PLATFORM_COLORS = { Daraz: '#E65100', Telemart: '#1565C0', iShopping: '#6A1B9A', Shophive: '#2E7D32' };

export default function PriceChart({ productId, darkMode }) {
  const { history, loading } = usePriceHistory(productId);

  if (loading) {
    return <div style={{height:220,background:'var(--bg2)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--t3)',fontSize:12}}>Loading price history...</div>;
  }

  if (!history || history.length === 0) {
    return <div style={{height:220,background:'var(--bg2)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--t3)',fontSize:12}}>No price history available yet</div>;
  }

  const platforms = [...new Set(history.map(h => h.platform))];
  const dates = [...new Set(history.map(h => h.date))].sort();

  const datasets = platforms.map(platform => {
    const pData = history.filter(h => h.platform === platform);
    const data = dates.map(d => { const r = pData.find(h => h.date === d); return r ? r.price_pkr : null; });
    return {
      label: platform,
      data,
      borderColor: PLATFORM_COLORS[platform] || '#6b7280',
      backgroundColor: (PLATFORM_COLORS[platform] || '#6b7280') + '20',
      tension: 0.3, fill: false, pointRadius: 3,
    };
  });

  return (
    <div style={{position:'relative',width:'100%',height:220}}>
      <Line data={{labels: dates.map(d => { const [m,day] = d.split('-').slice(1); const months = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; return `${months[parseInt(m)]} ${day}`; }), datasets}}
        options={{responsive:true,maintainAspectRatio:false,
          plugins:{legend:{position:'bottom',labels:{font:{size:10},usePointStyle:true,padding:8}},
            title:{display:false}},
          scales:{y:{ticks:{font:{size:10},callback:v=>`PKR ${(v/1000).toFixed(0)}K`},grid:{color:'rgba(0,0,0,0.04)'}},
            x:{ticks:{font:{size:10}},grid:{display:false}}}}}
      />
    </div>
  );
}
