// src/componets/Simulate.jsx
import React, { useContext, useState } from 'react';
import { SimulateContext } from '../context/SimulateContext';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Close } from '@mui/icons-material';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const initialForm = {
  duration: '',
  protocol_type: '',
  services: '',
  flag: '',
  src_byte: '',
  dstn_byte: '',
  logged_in: '',
  wrong_frag: '',
  same_dest_count: '',
  same_port_count: '',
};

const Simulate = () => {
  const { simulateAttack } = useContext(SimulateContext);
  const [formData, setFormData] = useState(initialForm);
  const [res, setRes] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const response = await simulateAttack(formData);
      setRes(response);
      setIsModalOpen(true);
    } catch (error) {
      setSubmitError('Simulation failed. Please try again.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const attackRFM = res?.rfm || {};
  const attackSVM = res?.svm || {};

  const chartDataRFM = {
    labels: ['Normal', 'DoS', 'U2R', 'R2L', 'Probe'],
    datasets: [
      {
        label: 'RFM values',
        data: [
          attackRFM.normal || 0,
          attackRFM.dos || 0,
          attackRFM.u2r || 0,
          attackRFM.r2l || 0,
          attackRFM.probe || 0,
        ],
        backgroundColor: ['#60a5fa', '#f87171', '#fb923c', '#34d399', '#c084fc'],
      },
    ],
  };

  const chartDataSVM = {
    labels: ['Normal', 'DoS', 'U2R', 'R2L', 'Probe'],
    datasets: [
      {
        label: 'SVM values',
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
      title: { display: false },
    },
    scales: {
      x: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(255,255,255,0.08)' } },
      y: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(255,255,255,0.08)' }, beginAtZero: true },
    },
  };

  return (
    <section className="simulate-page">
      <header className="page-header">
        <div>
          <p className="page-tag">Realtime Test</p>
          <h2>Simulate Traffic</h2>
          <p className="page-description">
            Submit a custom packet profile and inspect model predictions in a polished modal experience.
          </p>
        </div>
      </header>

      <div className="form-panel">
        <form onSubmit={handleSubmit} className="simulate-form">
          <div className="form-grid">
            <label className="form-group">
              <span>Duration</span>
              <input type="number" name="duration" value={formData.duration} onChange={handleChange} placeholder="0 - 54451" required />
            </label>
            <label className="form-group">
              <span>Protocol Type</span>
              <input type="text" name="protocol_type" value={formData.protocol_type} onChange={handleChange} placeholder="tcp / udp / icmp" required />
            </label>
            <label className="form-group">
              <span>Service</span>
              <input type="text" name="services" value={formData.services} onChange={handleChange} placeholder="Service name" required />
            </label>
            <label className="form-group">
              <span>Flag</span>
              <input type="text" name="flag" value={formData.flag} onChange={handleChange} placeholder="Connection flag" required />
            </label>
            <label className="form-group">
              <span>Src Bytes</span>
              <input type="number" name="src_byte" value={formData.src_byte} onChange={handleChange} placeholder="Source bytes" required />
            </label>
            <label className="form-group">
              <span>Dstn Bytes</span>
              <input type="number" name="dstn_byte" value={formData.dstn_byte} onChange={handleChange} placeholder="Destination bytes" required />
            </label>
            <label className="form-group">
              <span>Logged In</span>
              <input type="number" name="logged_in" value={formData.logged_in} onChange={handleChange} placeholder="0 or 1" required />
            </label>
            <label className="form-group">
              <span>Wrong Fragment</span>
              <input type="number" name="wrong_frag" value={formData.wrong_frag} onChange={handleChange} placeholder="Wrong fragment count" required />
            </label>
            <label className="form-group">
              <span>Same Dest Count</span>
              <input type="number" name="same_dest_count" value={formData.same_dest_count} onChange={handleChange} placeholder="Same destination count" required />
            </label>
            <label className="form-group">
              <span>Same Port Count</span>
              <input type="number" name="same_port_count" value={formData.same_port_count} onChange={handleChange} placeholder="Same port count" required />
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="action-button" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
            <button type="button" className="secondary-button" onClick={() => setFormData(initialForm)}>
              Reset
            </button>
          </div>
          {submitError && <div className="status-message error">{submitError}</div>}
        </form>
      </div>

      {isModalOpen && res && (
        <div className="modal-overlay">
          <div className="modal-content model-modal">
            <div className="model-header">
              <div>
                <p className="page-tag">Result Preview</p>
                <h2>Simulation result</h2>
              </div>
              <button type="button" className="closebtn" onClick={() => setIsModalOpen(false)}>
                <Close />
              </button>
            </div>

            <div className="result-grid">
              <article className="panel-card result-card">
                <h3>RFM Predictions</h3>
                <p className="panel-note">Prediction: {attackRFM.predictions ?? 'N/A'}</p>
                <p className="panel-note">Expected: {attackRFM.expected ?? 'N/A'}</p>
                <div className="chart-wrapper smaller-chart">
                  <Bar data={chartDataRFM} options={chartOptions} />
                </div>
              </article>
              <article className="panel-card result-card">
                <h3>SVM Predictions</h3>
                <p className="panel-note">Prediction: {attackSVM.predictionssvm ?? 'N/A'}</p>
                <p className="panel-note">Expected: {attackSVM.expected ?? 'N/A'}</p>
                <div className="chart-wrapper smaller-chart">
                  <Bar data={chartDataSVM} options={chartOptions} />
                </div>
              </article>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Simulate;
