import React, { useState, useMemo } from 'react';
import './App.css';
import AssetTable from './components/AssetTable';
import AssetForm from './components/AssetForm';
import { useAssets } from './hooks/useAssets';
import { TYPE_OPTIONS, STATUS_OPTIONS } from './utils/fields';

function App() {
  const { assets, loading, error, addAsset, editAsset, removeAsset } = useAssets();

  const [search,       setSearch]       = useState('');
  const [filterType,   setFilterType]   = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDept,   setFilterDept]   = useState('');
  const [showModal,    setShowModal]    = useState(false);
  const [editing,      setEditing]      = useState(null);

  const departments = useMemo(() => {
    const set = new Set(assets.map(a => a.department).filter(Boolean));
    return Array.from(set).sort();
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

  const openAdd  = () => { setEditing(null); setShowModal(true); };
  const openEdit = (asset) => { setEditing(asset); setShowModal(true); };
  const closeModal = () => { setEditing(null); setShowModal(false); };

  const handleSubmit = async (data) => {
    if (editing) await editAsset(editing.id, data);
    else         await addAsset(data);
    closeModal();
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>JPS Health Asset Registry</h1>
      </header>

      <main className="app-main">
        <div className="controls">
          <input
            className="search-input"
            type="search"
            placeholder="Search by tag, name, serial, location…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select value={filterType}   onChange={e => setFilterType(e.target.value)}>
            <option value="">All Categories</option>
            {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterDept}   onChange={e => setFilterDept(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Asset</button>
        </div>

        {error && (
          <div className="error-banner">
            Could not load assets: {error}
          </div>
        )}

        {loading
          ? <div className="loading-state">Loading assets…</div>
          : <AssetTable assets={filtered} onEdit={openEdit} onDelete={removeAsset} />
        }
      </main>

      {showModal && (
        <div
          className="modal-overlay"
          onClick={e => e.target === e.currentTarget && closeModal()}
        >
          <div className="modal" role="dialog" aria-modal="true">
            <div className="modal-header">
              <h2>{editing ? 'Edit Asset' : 'Add New Asset'}</h2>
              <button className="modal-close" onClick={closeModal} aria-label="Close">&times;</button>
            </div>
            <AssetForm
              initialData={editing}
              onSubmit={handleSubmit}
              onCancel={closeModal}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
