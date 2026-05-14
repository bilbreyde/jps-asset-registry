import { useState, useEffect, useCallback } from 'react';
import { getAssets, createAsset, updateAsset, deleteAsset } from '../utils/api';

export function useAssets() {
  const [assets, setAssets]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAssets();
      setAssets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addAsset = useCallback(async (data) => {
    const created = await createAsset(data);
    setAssets(prev => [...prev, created]);
    return created;
  }, []);

  const editAsset = useCallback(async (id, data) => {
    const updated = await updateAsset(id, data);
    setAssets(prev => prev.map(a => a.id === id ? updated : a));
    return updated;
  }, []);

  const removeAsset = useCallback(async (id) => {
    await deleteAsset(id);
    setAssets(prev => prev.filter(a => a.id !== id));
  }, []);

  return { assets, loading, error, addAsset, editAsset, removeAsset, reload: load };
}
