import React, { useState } from 'react';
import { ASSET_FIELDS } from '../utils/fields';

const COLUMNS = [
  'ciName',
  'assetTag',
  'assetType',
  'serialNumber',
  'location',
  'Department',
  'floor',
];

function SortArrow({ dir }) {
  return (
    <svg className="sort-icon" width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
      {dir === 'asc'
        ? <path d="M5 1.5l4 6H1l4-6z"/>
        : <path d="M5 8.5l4-6H1l4 6z"/>}
    </svg>
  );
}

function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-art" aria-hidden="true">
        <svg width="112" height="112" viewBox="0 0 112 112" fill="none">
          <rect x="18" y="24" width="76" height="82" rx="8" fill="#e8f0fa"/>
          <rect x="18" y="24" width="76" height="82" rx="8" stroke="#b3cfe8" strokeWidth="1.5"/>
          <rect x="38" y="16" width="36" height="16" rx="4" fill="#b3cfe8"/>
          <rect x="46" y="16" width="20" height="16" rx="4" fill="#0055A4" opacity="0.3"/>
          <rect x="32" y="54" width="48" height="5" rx="2.5" fill="#ccdff5"/>
          <rect x="32" y="67" width="36" height="5" rx="2.5" fill="#ccdff5"/>
          <rect x="32" y="80" width="42" height="5" rx="2.5" fill="#ccdff5"/>
          <circle cx="56" cy="41" r="12" fill="#0055A4" opacity="0.07"/>
          <rect x="53" y="36" width="6" height="10" rx="3" fill="#0055A4" opacity="0.45"/>
          <rect x="51" y="38" width="10" height="6" rx="3" fill="#0055A4" opacity="0.45"/>
        </svg>
      </div>
      <h3 className="empty-title">No assets found</h3>
      <p className="empty-body">Add your first asset using the button below, or adjust your search filters.</p>
    </div>
  );
}

function AssetTable({ assets, onEdit, onDelete }) {
  const [sortKey, setSortKey] = useState('ciName');
  const [sortDir, setSortDir] = useState('asc');

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = [...(assets ?? [])].sort((a, b) => {
    const av = String(a[sortKey] ?? '').toLowerCase();
    const bv = String(b[sortKey] ?? '').toLowerCase();
    return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  const labelOf = Object.fromEntries(ASSET_FIELDS.map(f => [f.key, f.label]));

  if (!sorted.length) return <EmptyState />;

  return (
    <div className="table-card">
      <div className="table-scroll">
        <table className="asset-table">
          <thead>
            <tr>
              {COLUMNS.map(col => (
                <th
                  key={col}
                  onClick={() => toggleSort(col)}
                  className={sortKey === col ? 'th-active' : ''}
                  aria-sort={sortKey === col ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  <span className="th-inner">
                    {labelOf[col] ?? col}
                    {sortKey === col && <SortArrow dir={sortDir} />}
                  </span>
                </th>
              ))}
              <th className="th-actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((asset, i) => (
              <tr key={asset.id} className={i % 2 === 1 ? 'row-stripe' : ''}>
                {COLUMNS.map(col => (
                  <td key={col}>
                    {asset[col] != null && asset[col] !== ''
                      ? asset[col]
                      : <span className="cell-nil">—</span>}
                  </td>
                ))}
                <td className="td-actions">
                  <button className="act-btn act-edit" onClick={() => onEdit(asset)} title="Edit asset">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M9.5 1.5l2 2-8 8H1.5v-2l8-8z"/>
                    </svg>
                    Edit
                  </button>
                  <button className="act-btn act-delete" onClick={() => onDelete(asset.id)} title="Delete asset">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M1 3.5h11M4.5 3.5V2h4v1.5M5.5 6v3.5M7.5 6v3.5M2 3.5l.9 8h7.2l.9-8"/>
                    </svg>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AssetTable;
