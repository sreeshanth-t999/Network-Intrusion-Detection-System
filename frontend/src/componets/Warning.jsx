import React from 'react';

const warnings = [
  { time: '12:20:56', srcIp: '192.56.0.1', dstIp: '127.0.0.1', type: 'Probe', score: '98%', severity: 'High' },
  { time: '12:27:13', srcIp: '10.30.12.4', dstIp: '172.16.0.8', type: 'DoS', score: '92%', severity: 'Critical' },
  { time: '12:33:44', srcIp: '185.24.66.12', dstIp: '10.0.0.22', type: 'U2R', score: '87%', severity: 'Medium' },
];

const Warning = () => {
  return (
    <section className="warning-page">
      <header className="page-header">
        <div>
          <p className="page-tag">Alerts</p>
          <h2>Threat Warnings</h2>
          <p className="page-description">
            Active warning events are surfaced with current severity and quick review actions.
          </p>
        </div>
      </header>

      <div className="table-panel">
        <table className="table warning-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Source IP</th>
              <th>Dest IP</th>
              <th>Attack Type</th>
              <th>Score</th>
              <th>Severity</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {warnings.map((item, index) => (
              <tr key={index}>
                <td>{item.time}</td>
                <td>{item.srcIp}</td>
                <td>{item.dstIp}</td>
                <td>{item.type}</td>
                <td>{item.score}</td>
                <td>{item.severity}</td>
                <td>
                  <button type="button" className="view-button">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="warning-metrics">
        <article className="metric-card">
          <span>Active Alerts</span>
          <strong>{warnings.length}</strong>
        </article>
        <article className="metric-card">
          <span>Critical</span>
          <strong>1</strong>
        </article>
        <article className="metric-card">
          <span>High</span>
          <strong>1</strong>
        </article>
      </div>
    </section>
  );
};

export default Warning;