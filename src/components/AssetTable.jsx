import React, { useState } from 'react';
import { ASSET_FIELDS } from '../utils/fields';

const COLUMNS = ['assetTag', 'name', 'type', 'location', 'department', 'status', 'assignedTo'];

const STATUS_CLASS = {
  'In Use':            'badge-in-use',
  'Available':         'badge-available',
  'Under Maintenance': 'badge-maintenance',
  'Retired':           'badge-retired',
};

function StatusBadge({ status }) {
  return <span className={`badge ${STATUS_CLASS[status] || 'badge-default'}`}>{status || '—'}</span>;
}

function AssetTable({ assets, onEdit, onDelete }) {
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = [...assets].sort((a, b) => {
    const av = String(a[sortKey] ?? '').toLowerCase();
    const bv = String(b[sortKey] ?? '').toLowerCase();
    return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  const fieldLabel = Object.fromEntries(ASSET_FIELDS.map(f => [f.key, f.label]));

  if (sorted.length === 0) {
    return <div className="empty-state">No assets match your search or filters.</div>;
  }

  return (
    <div className="table-wrapper">
      <p className="table-meta">{assets.length} asset{assets.length !== 1 ? 's' : ''}</p>
      <div className="table-scroll">
        <table className="asset-table">
          <thead>
            <tr>
              {COLUMNS.map(col => (
                <th key={col} onClick={() => toggleSort(col)} className={sortKey === col ? 'th-sorted' : ''}>
                  {fieldLabel[col] || col}
                  {sortKey === col && <span className="sort-arrow">{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>}
                </th>
              ))}
              <th className="th-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(asset => (
              <tr key={asset.id}>
                {COLUMNS.map(col => (
                  <td key={col}>
                    {col === 'status'
                      ? <StatusBadge status={asset[col]} />
                      : (asset[col] || '—')}
                  </td>
                ))}
                <td className="td-actions">
                  <button className="btn btn-sm btn-outline" onClick={() => onEdit(asset)}>Edit</button>
                  <button className="btn btn-sm btn-danger"  onClick={() => onDelete(asset.id)}>Delete</button>
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
