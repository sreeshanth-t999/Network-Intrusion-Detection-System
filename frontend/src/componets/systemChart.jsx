import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

const SystemChart = () => {
  const [systemData, setSystemData] = useState([]);

  useEffect(() => {
    const fetchSystemPerformance = async () => {
      try {
        const response = await fetch('http://localhost:8000/system-performance');
        const data = await response.json();
        setSystemData(data.systemData || []);
      } catch (error) {
        console.error('Error fetching system performance:', error);
      }
    };

    fetchSystemPerformance();
    const interval = setInterval(fetchSystemPerformance, 2000);
    return () => clearInterval(interval);
  }, []);

  const latest = systemData[systemData.length - 1] || {};
  const labels = systemData.map((entry) => entry.time);
  const cpuValues = systemData.map((entry) => entry.cpu);
  const memoryValues = systemData.map((entry) => entry.memory);
  const convertKBToMB = (value) => Number((value / 1024).toFixed(2));
  const networkSent = systemData.map((entry) => convertKBToMB(entry.network_sent));
  const networkRecv = systemData.map((entry) => convertKBToMB(entry.network_recv));

  const createChart = (label, data, borderColor, backgroundColor) => ({
    labels,
    datasets: [
      {
        label,
        data,
        borderColor,
        backgroundColor,
        fill: true,
        tension: 0.4,
      },
    ],
  });

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#e7eaf6' } },
    },
    scales: {
      x: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(255,255,255,0.08)' } },
      y: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(255,255,255,0.08)' }, beginAtZero: true },
    },
  };

  return (
    <section className="system-chart-page">
      <header className="page-header">
        <div>
          <p className="page-tag">Performance</p>
          <h2>System Metrics</h2>
          <p className="page-description">
            Monitor CPU, memory, and network trends in a compact, dark dashboard layout.
          </p>
        </div>
      </header>

      <div className="metric-row">
        <article className="metric-card">
          <span>CPU</span>
          <strong>{latest.cpu ?? 0}%</strong>
          <small>Latest load</small>
        </article>
        <article className="metric-card">
          <span>Memory</span>
          <strong>{latest.memory ?? 0}%</strong>
          <small>Latest utilization</small>
        </article>
        <article className="metric-card">
          <span>Network Sent</span>
          <strong>{convertKBToMB(latest.network_sent ?? 0)} MB</strong>
          <small>Recent throughput</small>
        </article>
      </div>

      <div className="chart-grid">
        <article className="chart-card">
          <h3>CPU Trend</h3>
          <div className="chart-wrapper smaller-chart">
            <Line data={createChart('CPU Usage (%)', cpuValues, 'rgba(255, 99, 132, 1)', 'rgba(255, 99, 132, 0.18)')} options={commonOptions} />
          </div>
        </article>
        <article className="chart-card">
          <h3>Memory Trend</h3>
          <div className="chart-wrapper smaller-chart">
            <Line data={createChart('Memory Usage (%)', memoryValues, 'rgba(54, 162, 235, 1)', 'rgba(54, 162, 235, 0.18)')} options={commonOptions} />
          </div>
        </article>
        <article className="chart-card">
          <h3>Network Activity</h3>
          <div className="chart-wrapper smaller-chart">
            <Line data={createChart('Network Sent / Received (MB)', networkSent, 'rgba(255, 206, 86, 1)', 'rgba(255, 206, 86, 0.18)')} options={commonOptions} />
          </div>
        </article>
      </div>
    </section>
  );
};

export default SystemChart;
