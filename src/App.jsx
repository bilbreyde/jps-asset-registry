import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import './App.css';
import Assets  from './pages/Assets';
import Reports from './pages/Reports';

/* ── Shared header icons ──────────────────────────────────── */
function LogoMark() {
  return (
    <svg className="logo-mark" width="38" height="38" viewBox="0 0 38 38" fill="none" aria-hidden="true">
      <rect width="38" height="38" rx="9" fill="rgba(255,255,255,0.15)"/>
      <path d="M16 7h6v9h9v6h-9v9h-6v-9H7v-6h9V7z" fill="white"/>
    </svg>
  );
}
function AssetsIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1" y="1" width="5" height="5" rx="1"/>
      <rect x="9" y="1" width="5" height="5" rx="1"/>
      <rect x="1" y="9" width="5" height="5" rx="1"/>
      <rect x="9" y="9" width="5" height="5" rx="1"/>
    </svg>
  );
}
function ReportsIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1" y="1" width="13" height="13" rx="1.5"/>
      <path d="M4 10V7M7.5 10V5M11 10V8"/>
    </svg>
  );
}

/* ── App shell ────────────────────────────────────────────── */
function App() {
  return (
    <div className="app">

      <header className="app-header">
        <div className="header-inner">
          <div className="header-brand">
            <LogoMark />
            <div className="brand-text">
              <span className="brand-name">JPS Health <strong>Asset Registry</strong></span>
              <span className="brand-sub">Healthcare IT Asset Management</span>
            </div>
          </div>

          <nav className="header-nav" aria-label="Main navigation">
            <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' nav-active' : ''}`}>
              <AssetsIcon />
              Assets
            </NavLink>
            <NavLink to="/reports" className={({ isActive }) => `nav-link${isActive ? ' nav-active' : ''}`}>
              <ReportsIcon />
              Reports
            </NavLink>
          </nav>

          <div className="header-user">
            <div className="user-avatar" aria-hidden="true">A</div>
            <span className="user-name">Admin</span>
          </div>
        </div>
      </header>

      <Routes>
        <Route path="/"        element={<Assets />}  />
        <Route path="/reports" element={<Reports />} />
      </Routes>

    </div>
  );
}

export default App;
