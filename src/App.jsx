import React, { useState, useMemo, useEffect, useRef } from 'react';
import './App.css';
import AssetTable from './components/AssetTable';
import AssetForm from './components/AssetForm';
import Toast from './components/Toast';
import { useAssets } from './hooks/useAssets';
import { useToast } from './hooks/useToast';
import { TYPE_OPTIONS, STATUS_OPTIONS } from './utils/fields';

/* ── Inline SVG icons ─────────────────────────────────────── */
function LogoMark() {
  return (
    <svg className="logo-mark" width="38" height="38" viewBox="0 0 38 38" fill="none" aria-hidden="true">
      <rect width="38" height="38" rx="9" fill="rgba(255,255,255,0.15)"/>
      <path d="M16 7h6v9h9v6h-9v9h-6v-9H7v-6h9V7z" fill="white"/>
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg className="search-icon" width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="6" cy="6" r="4.5"/>
      <path d="M9.5 9.5l3.5 3.5"/>
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <path d="M8.5 2v13M2 8.5h13"/>
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <path d="M2 2l13 13M15 2L2 15"/>
    </svg>
  );
}

/* ── Main App ─────────────────────────────────────────────── */
function App() {
  const { assets, loading, error, addAsset, editAsset, removeAsset } = useAssets();
  const { toasts, toast, dismiss } = useToast();

  const [search,       setSearch]       = useState('');
  const [filterType,   setFilterType]   = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDept,   setFilterDept]   = useState('');
  const [showModal,    setShowModal]    = useState(false);
  const [editing,      setEditing]      = useState(null);

  const prevError = useRef(null);
  useEffect(() => {
    if (error && error !== prevError.current) {
      toast(`Failed to load assets: ${error}`, 'error');
    }
    prevError.current = error;
  }, [error]); // eslint-disable-line react-hooks/exhaustive-deps

  const departments = useMemo(() => {
    const s = new Set(assets.map(a => a.department).filter(Boolean));
    return Array.from(s).sort();
  }, [assets]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return assets.filter(a => {
      if (q && !['assetTag', 'name', 'serialNumber', 'location', 'department', 'assignedTo']
        .some(k => String(a[k] ?? '').toLowerCase().includes(q))) return false;
      if (filterType   && a.type       !== filterType)   return false;
      if (filterStatus && a.status     !== filterStatus) return false;
      if (filterDept   && a.department !== filterDept)   return false;
      return true;
    });
  }, [assets, search, filterType, filterStatus, filterDept]);

  const hasFilters = !!(search || filterType || filterStatus || filterDept);

  const clearFilters = () => { setSearch(''); setFilterType(''); setFilterStatus(''); setFilterDept(''); };

  const openAdd    = ()      => { setEditing(null); setShowModal(true); };
  const openEdit   = (asset) => { setEditing(asset); setShowModal(true); };
  const closeModal = ()      => { setEditing(null); setShowModal(false); };

  const handleSubmit = async (data) => {
    try {
      if (editing) {
        await editAsset(editing.id, data);
        toast('Asset updated successfully');
      } else {
        await addAsset(data);
        toast('Asset added successfully');
      }
      closeModal();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await removeAsset(id);
      toast('Asset deleted');
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <div className="app">

      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-inner">
          <div className="header-brand">
            <LogoMark />
            <div className="brand-text">
              <span className="brand-name">JPS Health <strong>Asset Registry</strong></span>
              <span className="brand-sub">Healthcare IT Asset Management</span>
            </div>
          </div>
          <div className="header-user">
            <div className="user-avatar" aria-hidden="true">A</div>
            <span className="user-name">Admin</span>
          </div>
        </div>
      </header>

      {/* ── Page ── */}
      <main className="page-main">

        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-wrap">
            <SearchIcon />
            <input
              className="search-input"
              type="search"
              placeholder="Search by tag, name, serial, location…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search assets"
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')} aria-label="Clear search">×</button>
            )}
          </div>
          <div className="toolbar-filters">
            <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)} aria-label="Filter by category">
              <option value="">All Categories</option>
              {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} aria-label="Filter by status">
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="filter-select" value={filterDept} onChange={e => setFilterDept(e.target.value)} aria-label="Filter by department">
              <option value="">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          {hasFilters && (
            <button className="clear-btn" onClick={clearFilters}>Clear filters</button>
          )}
        </div>

        {/* Content */}
        {loading
          ? (
            <div className="loading-card">
              <div className="spin-ring" aria-label="Loading" role="status" />
              <p>Loading assets…</p>
            </div>
          )
          : <AssetTable assets={filtered} onEdit={openEdit} onDelete={handleDelete} />
        }
      </main>

      {/* ── FAB ── */}
      <button className="fab" onClick={openAdd} aria-label="Add new asset">
        <PlusIcon />
        <span className="fab-label">Add Asset</span>
      </button>

      {/* ── Modal ── */}
      {showModal && (
        <div
          className="modal-backdrop"
          onClick={e => e.target === e.currentTarget && closeModal()}
          role="presentation"
        >
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal-header">
              <h2 id="modal-title" className="modal-title">
                {editing ? 'Edit Asset' : 'Add New Asset'}
              </h2>
              <button className="modal-close" onClick={closeModal} aria-label="Close dialog">
                <CloseIcon />
              </button>
            </div>
            <AssetForm initialData={editing} onSubmit={handleSubmit} onCancel={closeModal} />
          </div>
        </div>
      )}

      {/* ── Toasts ── */}
      <Toast toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}

export default App;
