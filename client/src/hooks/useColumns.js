import { useState, useEffect, useCallback } from 'react';
import { getColumns, createColumn, updateColumn, deleteColumn, reorderColumns } from '../api/columns.js';

export function useColumns(boardId) {
  const [columns, setColumns]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    if (!boardId) return;
    getColumns(boardId)
      .then(res => { setColumns(res.data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [boardId]);

  const addColumn = useCallback(async (name, color = '#111111') => {
    const res = await createColumn(boardId, { name, color });
    setColumns(prev => [...prev, res.data]);
    return res.data;
  }, [boardId]);

  const renameColumn = useCallback(async (columnId, name) => {
    const res = await updateColumn(boardId, columnId, { name });
    setColumns(prev => prev.map(c => c._id === columnId ? res.data : c));
  }, [boardId]);

  const removeColumn = useCallback(async (columnId) => {
    await deleteColumn(boardId, columnId);
    setColumns(prev => prev.filter(c => c._id !== columnId));
  }, [boardId]);

  const reorder = useCallback(async (orderedIds) => {
    setColumns(prev => {
      const map = Object.fromEntries(prev.map(c => [c._id, c]));
      return orderedIds.map((id, i) => ({ ...map[id], position: i * 1000 }));
    });
    await reorderColumns(boardId, orderedIds);
  }, [boardId]);

  return { columns, loading, error, addColumn, renameColumn, removeColumn, reorder, setColumns };
}