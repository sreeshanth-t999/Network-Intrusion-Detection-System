// src/componets/Dataset.jsx
import { useContext } from 'react';
import { SimulateContext } from '../context/SimulateContext';

const Dataset = () => {
  const { data } = useContext(SimulateContext);

  return (
    <section className="dataset-page">
      <header className="page-header">
        <div>
          <p className="page-tag">Data Set</p>
          <h2>Dataset Explorer</h2>
          <p className="page-description">
            Review network records with a clean, dark table and quick attribute overview.
          </p>
        </div>
        <div className="dataset-summary">
          <span>{data.length}</span>
          <small>records loaded</small>
        </div>
      </header>

      <div className="table-panel">
        <table className="table dataset-table">
          <thead>
            <tr>
              <th>Duration</th>
              <th>Protocol</th>
              <th>Service</th>
              <th>Flag</th>
              <th>Src Bytes</th>
              <th>Dst Bytes</th>
              <th>Logged In</th>
              <th>Wrong Fragment</th>
              <th>Dst Host</th>
              <th>Dst Port</th>
              <th>Attack</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <tr key={index}>
                  <td>{item.duration}</td>
                  <td>{item.protocol_type}</td>
                  <td>{item.service}</td>
                  <td>{item.flag}</td>
                  <td>{item.src_bytes}</td>
                  <td>{item.dst_bytes}</td>
                  <td>{item.logged_in}</td>
                  <td>{item.wrong_fragment}</td>
                  <td>{item.dst_host_count}</td>
                  <td>{item.dst_host_srv_count}</td>
                  <td>{item.Class}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11">No dataset records available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Dataset;
