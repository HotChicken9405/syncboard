import { useMemo } from 'react';

export function useFilteredTasks(tasks, { search, priority, dueFilter, sortBy }) {
  return useMemo(() => {
    let filtered = [...tasks];

    // Search by title or assignee
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.assignee || '').toLowerCase().includes(q)
      );
    }

    // Filter by priority
    if (priority !== 'all') {
      filtered = filtered.filter(t => t.priority === priority);
    }

    // Filter by due date
    if (dueFilter !== 'all') {
      const now   = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const week  = new Date(today);
      week.setDate(week.getDate() + 7);

      filtered = filtered.filter(t => {
        if (!t.dueDate) return dueFilter === 'none';
        const due = new Date(t.dueDate);
        if (dueFilter === 'overdue')  return due < today;
        if (dueFilter === 'today')    return due >= today && due < new Date(today.getTime() + 86400000);
        if (dueFilter === 'week')     return due >= today && due <= week;
        if (dueFilter === 'none')     return !t.dueDate;
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'due_asc') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (sortBy === 'due_desc') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(b.dueDate) - new Date(a.dueDate);
      }
      if (sortBy === 'priority') {
        const order = { high: 0, normal: 1, low: 2 };
        return (order[a.priority] ?? 1) - (order[b.priority] ?? 1);
      }
      if (sortBy === 'created') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      // default: position
      return (a.position ?? 0) - (b.position ?? 0);
    });

    return filtered;
  }, [tasks, search, priority, dueFilter, sortBy]);
}