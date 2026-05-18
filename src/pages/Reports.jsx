import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, ArcElement,
  Title, Tooltip, Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { getReports } from '../utils/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

/* ── Color palettes ───────────────────────────────────────── */
const BLUE   = '#0055A4';
const BLUES  = ['#0055A4','#0072CE','#2E86C1','#5499C7','#7FB3D3','#A9CCE3','#D4E6F1','#1F618D','#154360','#2471A3','#2980B9','#1A5276','#3498DB','#0066CC','#004A8F'];
const MULTI  = ['#0055A4','#10B981','#F59E0B','#EF4444','#8B5CF6','#06B6D4','#F97316','#EC4899','#059669','#DC2626','#6366F1','#84CC16','#14B8A6','#FB923C','#A855F7'];

/* ── Chart default options ────────────────────────────────── */
const BASE_BAR = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 11 }, maxRotation: 35, minRotation: 0 } },
    y: { beginAtZero: true, ticks: { font: { size: 11 } }, grid: { color: '#f1f5f9' } },
  },
};

const HBAR_OPTS = {
  ...BASE_BAR,
  indexAxis: 'y',
  scales: {
    x: { beginAtZero: true, ticks: { font: { size: 11 } }, grid: { color: '#f1f5f9' } },
    y: { grid: { display: false }, ticks: { font: { size: 11 } } },
  },
};

const PIE_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'right', labels: { font: { size: 11 }, boxWidth: 12, padding: 10 } },
  },
};

/* ── Helpers ──────────────────────────────────────────────── */
function toBarData(items, colors) {
  return {
    labels: items.map(d => d.label ?? '(blank)'),
    datasets: [{
      data: items.map(d => d.count),
      backgroundColor: Array.isArray(colors) ? items.map((_, i) => colors[i % colors.length]) : colors,
      borderRadius: 4,
      borderSkipped: false,
    }],
  };
}

function toPieData(items) {
  return {
    labels: items.map(d => d.label ?? '(blank)'),
    datasets: [{ data: items.map(d => d.count), backgroundColor: items.map((_, i) => MULTI[i % MULTI.length]), borderWidth: 1 }],
  };
}

/* ── Sub-components ───────────────────────────────────────── */
function ChartCard({ title, tall, children }) {
  return (
    <div className="chart-card">
      <h2 className="chart-title">{title}</h2>
      <div className={tall ? 'chart-wrap chart-wrap-tall' : 'chart-wrap'}>{children}</div>
    </div>
  );
}

function ReportsLoading() {
  return (
    <main className="page-main">
      <div className="loading-card">
        <div className="spin-ring" aria-label="Loading" role="status" />
        <p>Loading report data…</p>
      </div>
    </main>
  );
}

function ReportsError({ message }) {
  return (
    <main className="page-main">
      <div className="loading-card">
        <p style={{ color: 'var(--red)' }}>Failed to load reports: {message}</p>
      </div>
    </main>
  );
}

/* ── Main component ───────────────────────────────────────── */
function Reports() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    getReports()
      .then(d  => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <ReportsLoading />;
  if (error)   return <ReportsError message={error} />;

  const typeData  = toBarData(data.byType,       BLUE);
  const deptData  = toBarData(data.byDepartment, BLUES);
  const locData   = toPieData(data.byLocation);
  const floorData = toBarData(data.byFloor,      BLUE);

  return (
    <main className="page-main">
      <div className="reports-header">
        <h1 className="reports-heading">Asset Reports</h1>
        <p className="reports-sub">Aggregated counts across all {(
          data.byType.reduce((s, d) => s + d.count, 0)
        ).toLocaleString()} assets</p>
      </div>

      <div className="reports-grid">

        <ChartCard title="Assets by Type">
          <Bar data={typeData} options={BASE_BAR} />
        </ChartCard>

        <ChartCard title="Assets by Department (Top 15)" tall>
          <Bar data={deptData} options={HBAR_OPTS} />
        </ChartCard>

        <ChartCard title="Assets by Location (Top 15)">
          <Pie data={locData} options={PIE_OPTS} />
        </ChartCard>

        <ChartCard title="Assets by Floor">
          <Bar data={floorData} options={BASE_BAR} />
        </ChartCard>

      </div>
    </main>
  );
}

export default Reports;
