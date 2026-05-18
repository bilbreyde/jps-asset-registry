import { useState, useEffect, useCallback, useRef } from 'react';
import { getAssets, createAsset, updateAsset, deleteAsset } from '../utils/api';

export function useAssets({
  pageSize   = 50,
  search     = '',
  filterDept = '',
} = {}) {
  const [assets,      setAssets]  = useState([]);
  const [loading,     setLoading] = useState(true);
  const [error,       setError]   = useState(null);
  const [totalCount,  setTotal]   = useState(0);
  const [departments, setDepts]   = useState([]);
  const [currentPage, setPage]    = useState(0);
  const [hasMore,     setHasMore] = useState(false);

  // tokenStack[i] = continuationToken needed to fetch page i (undefined = no token = page 0)
  const tokenStack = useRef([undefined]);

  const fetchPage = useCallback(async (pageIdx) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      params.pageSize = pageSize;
      if (tokenStack.current[pageIdx]) params.continuationToken = tokenStack.current[pageIdx];
      if (search)     params.q          = search;
      if (filterDept) params.department = filterDept;

      const data = await getAssets(params);

      // Normalize: API always returns { assets, count, hasMore } but guard defensively
      const responseAssets = Array.isArray(data?.assets) ? data.assets : [];
      setAssets(responseAssets);
      setTotal(data?.count ?? 0);
      setHasMore(data?.hasMore ?? false);
      setPage(pageIdx);

      if (data?.hasMore && data?.continuationToken) {
        tokenStack.current[pageIdx + 1] = data.continuationToken;
      }

      if (data?.departments !== undefined) {
        setDepts(data.departments);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pageSize, search, filterDept]);

  // Reset to page 0 whenever filters or page size change
  useEffect(() => {
    tokenStack.current = [undefined];
    fetchPage(0);
  }, [fetchPage]);

  const goNext = useCallback(() => {
    if (hasMore) fetchPage(currentPage + 1);
  }, [hasMore, currentPage, fetchPage]);

  const goPrev = useCallback(() => {
    if (currentPage > 0) fetchPage(currentPage - 1);
  }, [currentPage, fetchPage]);

  const reload = useCallback(() => {
    tokenStack.current = [undefined];
    fetchPage(0);
  }, [fetchPage]);

  const addAsset = useCallback(async (data) => {
    const created = await createAsset(data);
    reload();
    return created;
  }, [reload]);

  const editAsset = useCallback(async (id, data) => {
    const updated = await updateAsset(id, data);
    setAssets(prev => prev.map(a => a.id === id ? updated : a));
    return updated;
  }, []);

  const removeAsset = useCallback(async (id) => {
    await deleteAsset(id);
    reload();
  }, [reload]);

  return {
    assets, loading, error,
    totalCount, departments, currentPage, hasMore,
    goNext, goPrev, reload,
    addAsset, editAsset, removeAsset,
  };
}
