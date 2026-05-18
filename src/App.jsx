import React, { useState, useEffect, useRef } from 'react';
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
  const [searchInput,  setSearchInput]  = useState('');
  const [search,       setSearch]       = useState('');
  const [filterType,   setFilterType]   = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDept,   setFilterDept]   = useState('');
  const [pageSize,     setPageSize]     = useState(50);
  const [showModal,    setShowModal]    = useState(false);
  const [editing,      setEditing]      = useState(null);

  const debounceRef = useRef(null);
  const handleSearchChange = (val) => {
    setSearchInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(val), 300);
  };

  const {
    assets, loading, error,
    totalCount, departments, currentPage, hasMore,
    goNext, goPrev,
    addAsset, editAsset, removeAsset,
  } = useAssets({ pageSize, search, filterType, filterStatus, filterDept });

  const { toasts, toast, dismiss } = useToast();

  const prevError = useRef(null);
  useEffect(() => {
    if (error && error !== prevError.current) {
      toast(`Failed to load assets: ${error}`, 'error');
    }
    prevError.current = error;
  }, [error]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasFilters = !!(search || filterType || filterStatus || filterDept);
  const clearFilters = () => {
    setSearchInput(''); setSearch('');
    setFilterType(''); setFilterStatus(''); setFilterDept('');
  };

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

  const startItem = totalCount === 0 ? 0 : currentPage * pageSize + 1;
  const endItem   = Math.min(currentPage * pageSize + (assets?.length ?? 0), totalCount);

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
              value={searchInput}
              onChange={e => handleSearchChange(e.target.value)}
              aria-label="Search assets"
            />
            {searchInput && (
              <button className="search-clear" onClick={() => handleSearchChange('')} aria-label="Clear search">×</button>
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

        {/* Pagination bar */}
        <div className="pagination-bar">
          <span className="pagination-info">
            {loading
              ? 'Loading…'
              : totalCount === 0
                ? 'No records'
                : `Showing ${startItem.toLocaleString()}–${endItem.toLocaleString()} of ${totalCount.toLocaleString()} records`
            }
          </span>
          <div className="pagination-controls">
            <label className="page-size-label">
              Per page:
              <select
                className="page-size-select"
                value={pageSize}
                onChange={e => setPageSize(Number(e.target.value))}
                aria-label="Records per page"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </label>
            <button
              className="page-btn"
              onClick={goPrev}
              disabled={currentPage === 0 || loading}
              aria-label="Previous page"
            >
              ← Prev
            </button>
            <span className="page-num">Page {currentPage + 1}</span>
            <button
              className="page-btn"
              onClick={goNext}
              disabled={!hasMore || loading}
              aria-label="Next page"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Content */}
        {loading
          ? (
            <div className="loading-card">
              <div className="spin-ring" aria-label="Loading" role="status" />
              <p>Loading assets…</p>
            </div>
          )
          : <AssetTable assets={assets} onEdit={openEdit} onDelete={handleDelete} />
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
