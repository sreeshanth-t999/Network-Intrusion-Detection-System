import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Model = ({ isOpen, onClose, result = {} }) => {
  if (!isOpen) return null;

  const attackRFM = result.rfm || {};
  const attackSVM = result.svm || {};

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
        backgroundColor: ['#60a5fa', '#fb7185', '#f97316', '#34d399', '#a78bfa'],
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
        backgroundColor: ['#38bdf8', '#f472b6', '#a855f7', '#fbbf24', '#22c55e'],
      },
    ],
  };

  const chartOptions = {
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
    <div className="modal-overlay">
      <div className="modal-content model-modal">
        <div className="model-header">
          <div>
            <p className="page-tag">Model Insight</p>
            <h2>Prediction Summary</h2>
          </div>
          <button type="button" className="closebtn" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="result-grid">
          <article className="panel-card result-card">
            <h3>RFM Output</h3>
            <p className="panel-note">Expected: {attackRFM.expected ?? 'N/A'}</p>
            <p className="panel-note">Prediction: {attackRFM.predictions ?? 'N/A'}</p>
            <div className="chart-wrapper smaller-chart">
              <Bar data={chartDataRFM} options={chartOptions} />
            </div>
          </article>

          <article className="panel-card result-card">
            <h3>SVM Output</h3>
            <p className="panel-note">Expected: {attackSVM.expected ?? 'N/A'}</p>
            <p className="panel-note">Prediction: {attackSVM.predictionssvm ?? 'N/A'}</p>
            <div className="chart-wrapper smaller-chart">
              <Bar data={chartDataSVM} options={chartOptions} />
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};

export default Model;
