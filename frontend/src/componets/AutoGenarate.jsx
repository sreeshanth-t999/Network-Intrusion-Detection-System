import React, { useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const attackTypes = [
  { label: 'Normal', value: 'normal' },
  { label: 'DoS', value: 'dos' },
  { label: 'U2R', value: 'u2r' },
  { label: 'R2L', value: 'r2l' },
  { label: 'Probe', value: 'probe' },
];

const AutoGenerate = () => {
  const [attack, setAttack] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const instance = axios.create({ baseURL: 'http://127.0.0.1:8000' });

  const createAttack = async (type) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await instance.post('/simulate/', { type });
      setAttack(response.data);
    } catch (err) {
      setError('Unable to generate attack.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const attackRFM = attack?.rfm || {};
  const attackSVM = attack?.svm || {};

  const chartDataRFM = {
    labels: ['Normal', 'DoS', 'U2R', 'R2L', 'Probe'],
    datasets: [
      {
        label: 'RFM probability',
        data: [
          attackRFM.normal || 0,
          attackRFM.dos || 0,
          attackRFM.u2r || 0,
          attackRFM.r2l || 0,
          attackRFM.probe || 0,
        ],
        backgroundColor: ['#7c3aed', '#ef4444', '#f97316', '#14b8a6', '#60a5fa'],
      },
    ],
  };

  const chartDataSVM = {
    labels: ['Normal', 'DoS', 'U2R', 'R2L', 'Probe'],
    datasets: [
      {
        label: 'SVM probability',
        data: [
          attackSVM.normal || 0,
          attackSVM.dos || 0,
          attackSVM.u2r || 0,
          attackSVM.r2l || 0,
          attackSVM.probe || 0,
        ],
        backgroundColor: ['#38bdf8', '#f472b6', '#a855f7', '#fbbf24', '#34d399'],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#e7eaf6' } },
      title: { display: false },
    },
    scales: {
      x: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(255,255,255,0.08)' } },
      y: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(255,255,255,0.08)' }, beginAtZero: true },
    },
  };

  return (
    <section className="auto-page">
      <header className="page-header">
        <div>
          <p className="page-tag">Auto Generate</p>
          <h2>Attack Simulation</h2>
          <p className="page-description">
            Choose a threat type and review probability scores from both RFM and SVM models.
          </p>
        </div>
      </header>

      <div className="action-panel">
        <div className="action-chips">
          {attackTypes.map((option) => (
            <button
              key={option.value}
              type="button"
              className="chip-button"
              onClick={() => createAttack(option.value)}
              disabled={isLoading}
            >
              {option.label}
            </button>
          ))}
        </div>
        {error && <div className="status-message error">{error}</div>}
        {isLoading && <div className="status-message">Generating attack, please wait…</div>}
      </div>

      {attack ? (
        <div className="result-grid">
          <article className="panel-card result-card">
            <h3>RFM results</h3>
            <p className="panel-note">Expected: {attackRFM.expected ?? 'N/A'}</p>
            <p className="panel-note">Prediction: {attackRFM.predictions ?? 'N/A'}</p>
            <div className="chart-wrapper smaller-chart">
              <Bar data={chartDataRFM} options={chartOptions} />
            </div>
          </article>

          <article className="panel-card result-card">
            <h3>SVM results</h3>
            <p className="panel-note">Expected: {attackSVM.expected ?? 'N/A'}</p>
            <p className="panel-note">Prediction: {attackSVM.predictionssvm ?? 'N/A'}</p>
            <div className="chart-wrapper smaller-chart">
              <Bar data={chartDataSVM} options={chartOptions} />
            </div>
          </article>
        </div>
      ) : (
        <div className="empty-state">
          <p>Select a threat type to generate attack predictions and charts.</p>
        </div>
      )}
    </section>
  );
};

export default AutoGenerate;
