// src/componets/Dashboard.jsx
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

const Dashboard = () => {
  const [systemData, setSystemData] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/dashboard/");
        setDashboardData(res.data);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      }
    };

    fetchDashboard();
  }, []);

  useEffect(() => {
    const fetchSystemPerformance = async () => {
      try {
        const response = await fetch("http://localhost:8000/system-performance");
        const data = await response.json();
        setSystemData(data.systemData || []);
      } catch (error) {
        console.error("Error fetching system performance:", error);
      }
    };

    fetchSystemPerformance();
    const interval = setInterval(fetchSystemPerformance, 2000);
    return () => clearInterval(interval);
  }, []);

  const latestSystem = systemData.length
    ? systemData[systemData.length - 1]
    : { cpu: 0, memory: 0, network_sent: 0, network_recv: 0 };

  const convertKBToMB = (value) => Number((value / 1024).toFixed(2));

  const labels = systemData.map((entry) => entry.time);
  const cpuValues = systemData.map((entry) => entry.cpu);
  const memoryValues = systemData.map((entry) => entry.memory);
  const networkSent = systemData.map((entry) => convertKBToMB(entry.network_sent));
  const networkRecv = systemData.map((entry) => convertKBToMB(entry.network_recv));

  const dashboardPoints = dashboardData?.dayWiseData || dashboardData?.daywiseData || [];
  const dashLabels = dashboardPoints.map((entry) => entry.day || entry.date || '');
  const normalData = dashboardPoints.map((entry) => entry.normal || entry.normal_count || 0);
  const probData = dashboardPoints.map((entry) => entry.prob || entry.probe || 0);
  const dosData = dashboardPoints.map((entry) => entry.dos || entry.dos_count || 0);
  const u2rData = dashboardPoints.map((entry) => entry.u2r || entry.u2r_count || 0);
  const r2lData = dashboardPoints.map((entry) => entry.r2l || entry.r2l_count || 0);

  const attackTotals = {
    normal: normalData.reduce((sum, value) => sum + value, 0),
    probe: probData.reduce((sum, value) => sum + value, 0),
    dos: dosData.reduce((sum, value) => sum + value, 0),
    u2r: u2rData.reduce((sum, value) => sum + value, 0),
    r2l: r2lData.reduce((sum, value) => sum + value, 0),
  };

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: "#e7eaf6", font: { size: 13 } } },
    },
    scales: {
      x: {
        ticks: { color: "#a7b0d1" },
        grid: { color: "rgba(255, 255, 255, 0.08)" },
      },
      y: {
        ticks: { color: "#a7b0d1" },
        grid: { color: "rgba(255, 255, 255, 0.08)" },
        beginAtZero: true,
      },
    },
  };

  const cpuData = {
    labels,
    datasets: [
      {
        label: "CPU Usage (%)",
        data: cpuValues,
        borderColor: "rgba(255, 104, 172, 1)",
        backgroundColor: "rgba(255, 104, 172, 0.2)",
        fill: true,
        tension: 0.35,
      },
    ],
  };

  const memoryData = {
    labels,
    datasets: [
      {
        label: "Memory Usage (%)",
        data: memoryValues,
        borderColor: "rgba(98, 181, 255, 1)",
        backgroundColor: "rgba(98, 181, 255, 0.2)",
        fill: true,
        tension: 0.35,
      },
    ],
  };

  const networkData = {
    labels,
    datasets: [
      {
        label: "Network Sent (MB)",
        data: networkSent,
        borderColor: "rgba(255, 193, 7, 1)",
        backgroundColor: "rgba(255, 193, 7, 0.18)",
        fill: true,
        tension: 0.35,
      },
      {
        label: "Network Received (MB)",
        data: networkRecv,
        borderColor: "rgba(42, 199, 156, 1)",
        backgroundColor: "rgba(42, 199, 156, 0.2)",
        fill: true,
        tension: 0.35,
      },
    ],
  };

  const attackData = {
    labels: dashLabels,
    datasets: [
      {
        label: "Normal",
        data: normalData,
        borderColor: "rgba(70, 235, 115, 1)",
        backgroundColor: "rgba(70, 235, 115, 0.24)",
        fill: true,
        tension: 0.35,
      },
      {
        label: "DoS",
        data: dosData,
        borderColor: "rgba(255, 183, 76, 1)",
        backgroundColor: "rgba(255, 183, 76, 0.2)",
        fill: true,
        tension: 0.35,
      },
      {
        label: "Probe",
        data: probData,
        borderColor: "rgba(193, 90, 255, 1)",
        backgroundColor: "rgba(193, 90, 255, 0.2)",
        fill: true,
        tension: 0.35,
      },
      {
        label: "U2R",
        data: u2rData,
        borderColor: "rgba(255, 110, 108, 1)",
        backgroundColor: "rgba(255, 110, 108, 0.18)",
        fill: true,
        tension: 0.35,
      },
      {
        label: "R2L",
        data: r2lData,
        borderColor: "rgba(84, 255, 164, 1)",
        backgroundColor: "rgba(84, 255, 164, 0.18)",
        fill: true,
        tension: 0.35,
      },
    ],
  };

  return (
    <section className="dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-title-group">
          <p className="dashboard-label">Realtime Overview</p>
          <h1>Security Dashboard</h1>
          <p className="dashboard-subtitle">
            Live performance metrics, threat activity, and historical trends for your network.
          </p>
        </div>
        <div className="dashboard-chip">Auto-refresh every 2 seconds</div>
      </header>

      <div className="dashboard-highlights">
        <article className="dashboard-card accent-card">
          <span>CPU</span>
          <strong>{latestSystem.cpu ?? 0}%</strong>
          <small>Latest load</small>
        </article>
        <article className="dashboard-card accent-card">
          <span>Memory</span>
          <strong>{latestSystem.memory ?? 0}%</strong>
          <small>Current usage</small>
        </article>
        <article className="dashboard-card accent-card">
          <span>Network</span>
          <strong>{convertKBToMB(latestSystem.network_sent ?? 0)} / {convertKBToMB(latestSystem.network_recv ?? 0)}</strong>
          <small>MB sent / received</small>
        </article>
      </div>

      <div className="dashboard-grid">
        <section className="panel-card large-panel">
          <div className="panel-header">
            <div>
              <h2>Network Activity</h2>
              <p>Daily event classification across threat categories</p>
            </div>
          </div>
          <div className="chart-wrapper">
            {dashboardPoints.length > 0 ? (
              <Line data={attackData} options={baseOptions} />
            ) : (
              <div className="empty-chart-state">
                No network activity data available.
              </div>
            )}
          </div>
        </section>

        <section className="panel-card stats-panel">
          <div className="panel-header">
            <h2>Threat Totals</h2>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <span>Normal</span>
              <strong>{attackTotals.normal}</strong>
            </div>
            <div className="stat-card">
              <span>Probe</span>
              <strong>{attackTotals.probe}</strong>
            </div>
            <div className="stat-card">
              <span>DoS</span>
              <strong>{attackTotals.dos}</strong>
            </div>
            <div className="stat-card">
              <span>U2R</span>
              <strong>{attackTotals.u2r}</strong>
            </div>
            <div className="stat-card">
              <span>R2L</span>
              <strong>{attackTotals.r2l}</strong>
            </div>
          </div>
        </section>
      </div>

      <div className="dashboard-row">
        <section className="panel-card">
          <div className="panel-header">
            <h3>CPU Trend</h3>
          </div>
          <div className="chart-wrapper smaller-chart">
            <Line data={cpuData} options={baseOptions} />
          </div>
        </section>
        <section className="panel-card">
          <div className="panel-header">
            <h3>Memory Trend</h3>
          </div>
          <div className="chart-wrapper smaller-chart">
            <Line data={memoryData} options={baseOptions} />
          </div>
        </section>
        <section className="panel-card">
          <div className="panel-header">
            <h3>Network Trend</h3>
          </div>
          <div className="chart-wrapper smaller-chart">
            <Line data={networkData} options={baseOptions} />
          </div>
        </section>
      </div>
    </section>
  );
};

export default Dashboard;
