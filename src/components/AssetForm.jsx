import React, { useState } from 'react';
import { ASSET_FIELDS } from '../utils/fields';

const FIELD_MAP = Object.fromEntries(ASSET_FIELDS.map(f => [f.key, f]));

const SECTIONS = [
  {
    title: 'Identity',
    keys: ['_CI_Name_Type_And_Model', 'AssetTag', 'ivnt_AssetFullType', 'ivnt_AssignedModel', 'SerialNumber'],
  },
  {
    title: 'Location',
    keys: ['ivnt_LocationName', '_Department', '_Floor', '_Area'],
  },
];

function Field({ field, value, error, onChange }) {
  const sharedProps = {
    id: field.key,
    value,
    onChange: e => onChange(field.key, e.target.value),
    className: `form-control${error ? ' is-error' : ''}`,
  };

  return (
    <div className="form-group">
      <label className="form-label" htmlFor={field.key}>
        {field.label}
        {field.required && <span className="req-mark" aria-hidden="true"> *</span>}
      </label>
      {field.type === 'select' ? (
        <select {...sharedProps}>
          <option value="">Select {field.label}…</option>
          {field.options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={field.type} {...sharedProps} />
      )}
      {error && <p className="field-err">{error}</p>}
    </div>
  );
}

function AssetForm({ initialData, onSubmit, onCancel }) {
  const blank = Object.fromEntries(ASSET_FIELDS.map(f => [f.key, '']));
  const [data,       setData]       = useState(() => initialData ? { ...blank, ...initialData } : blank);
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    ASSET_FIELDS.filter(f => f.required).forEach(f => {
      if (!data[f.key]) errs[f.key] = `${f.label} is required`;
    });
    return errs;
  };

  const handleChange = (key, value) => {
    setData(prev => ({ ...prev, [key]: value }));
    setErrors(prev => { const e = { ...prev }; delete e[key]; return e; });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      await onSubmit(data);
    } catch (err) {
      setErrors({ _form: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="asset-form" onSubmit={handleSubmit} noValidate>
      {errors._form && (
        <div className="form-alert" role="alert">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="7.5" cy="7.5" r="6.25"/>
            <path d="M7.5 4.5v3.5M7.5 10v.5"/>
          </svg>
          {errors._form}
        </div>
      )}

      {SECTIONS.map((section, si) => (
        <div key={section.title} className={`form-section${si > 0 ? ' form-section-sep' : ''}`}>
          <p className="section-label">{section.title}</p>
          <div className="form-grid">
            {section.keys.map(key => {
              const field = FIELD_MAP[key];
              return field
                ? <Field key={key} field={field} value={data[key] ?? ''} error={errors[key]} onChange={handleChange} />
                : null;
            })}
          </div>
        </div>
      ))}

      <div className="form-footer">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary btn-submit" disabled={submitting}>
          {submitting
            ? <><span className="btn-spinner" aria-hidden="true" /> Saving…</>
            : initialData ? 'Save Changes' : 'Add Asset'}
        </button>
      </div>
    </form>
  );
}

export default AssetForm;
