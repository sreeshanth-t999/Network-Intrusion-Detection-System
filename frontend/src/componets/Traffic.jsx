import React, { useContext, useEffect } from 'react';
import { SimulateContext } from '../context/SimulateContext';

const Traffic = () => {
  const { trafficData, fetchTraffic } = useContext(SimulateContext);

  useEffect(() => {
    fetchTraffic();
  }, [fetchTraffic]);

  return (
    <section className="traffic-page">
      <header className="page-header">
        <div>
          <p className="page-tag">Traffic</p>
          <h2>Realtime Traffic Feed</h2>
          <p className="page-description">
            Streamed connection events with model predictions for SVM and RFM.
          </p>
        </div>
      </header>

      <div className="table-panel">
        <table className="table traffic-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>SVM</th>
              <th>RFM</th>
              <th>Src IP</th>
              <th>Dst IP</th>
              <th>Duration</th>
              <th>Protocol</th>
              <th>Service</th>
              <th>Flag</th>
              <th>Src Bytes</th>
              <th>Dst Bytes</th>
              <th>Login</th>
              <th>Wrong Frag</th>
              <th>Same Dest</th>
              <th>Same Port</th>
            </tr>
          </thead>
          <tbody>
            {trafficData && trafficData.length > 0 ? (
              trafficData.map((item, index) => (
                <tr key={index}>
                  <td>{item.time}</td>
                  <td>{item.prediction_svm || '0'}</td>
                  <td>{item.prediction_rfm || '0'}</td>
                  <td>{item.src_ip || '0'}</td>
                  <td>{item.dst_ip || '0'}</td>
                  <td>{item.duration || '0'}</td>
                  <td>{item.protocol || 'n/a'}</td>
                  <td>{item.service || 'n/a'}</td>
                  <td>{item.Flag || 'n/a'}</td>
                  <td>{item.SrcBytes || '0'}</td>
                  <td>{item.DstBytes || '0'}</td>
                  <td>{item.LoginStatus || '0'}</td>
                  <td>{item.WrongFragment || '0'}</td>
                  <td>{item.SameDestCount || '0'}</td>
                  <td>{item.SamePortCount || '0'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="15">No traffic records available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Traffic;
