import React, { useState } from 'react';
import { ASSET_FIELDS } from '../utils/fields';

function AssetForm({ initialData, onSubmit, onCancel }) {
  const blank = Object.fromEntries(ASSET_FIELDS.map(f => [f.key, '']));

  const [formData,   setFormData]   = useState(() => initialData ? { ...blank, ...initialData } : blank);
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    ASSET_FIELDS.filter(f => f.required).forEach(f => {
      if (!formData[f.key]) errs[f.key] = `${f.label} is required`;
    });
    return errs;
  };

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setErrors(prev => { const e = { ...prev }; delete e[key]; return e; });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      setErrors({ _form: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="asset-form" onSubmit={handleSubmit} noValidate>
      {errors._form && <div className="form-error-banner">{errors._form}</div>}
      <div className="form-grid">
        {ASSET_FIELDS.map(field => (
          <div key={field.key} className={`form-group${field.key === 'name' ? ' form-group-wide' : ''}`}>
            <label htmlFor={field.key}>
              {field.label}
              {field.required && <span className="required"> *</span>}
            </label>
            {field.type === 'select' ? (
              <select
                id={field.key}
                value={formData[field.key]}
                onChange={e => handleChange(field.key, e.target.value)}
                className={errors[field.key] ? 'input-error' : ''}
              >
                <option value="">Select {field.label}…</option>
                {field.options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input
                id={field.key}
                type={field.type}
                value={formData[field.key]}
                onChange={e => handleChange(field.key, e.target.value)}
                className={errors[field.key] ? 'input-error' : ''}
              />
            )}
            {errors[field.key] && <span className="field-error">{errors[field.key]}</span>}
          </div>
        ))}
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : (initialData ? 'Save Changes' : 'Add Asset')}
        </button>
      </div>
    </form>
  );
}

export default AssetForm;
