import styles from './SearchFilterBar.module.css';

const PRIORITIES = [
  { value: 'all',    label: 'All Priorities' },
  { value: 'high',   label: 'High' },
  { value: 'normal', label: 'Normal' },
  { value: 'low',    label: 'Low' },
];

const DUE_FILTERS = [
  { value: 'all',     label: 'Any Due Date' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'today',   label: 'Due Today' },
  { value: 'week',    label: 'Due This Week' },
  { value: 'none',    label: 'No Due Date' },
];

const SORT_OPTIONS = [
  { value: 'position',  label: 'Default Order' },
  { value: 'created',   label: 'Date Created' },
  { value: 'due_asc',   label: 'Due Date (Earliest)' },
  { value: 'due_desc',  label: 'Due Date (Latest)' },
  { value: 'priority',  label: 'Priority' },
];

export default function SearchFilterBar({ filters, onChange, totalResults, totalTasks }) {
  const { search, priority, dueFilter, sortBy } = filters;

  const isFiltering = search || priority !== 'all' || dueFilter !== 'all' || sortBy !== 'position';

  const handleClear = () => {
    onChange({ search: '', priority: 'all', dueFilter: 'all', sortBy: 'position' });
  };

  return (
    <div className={styles.bar}>
      <div className={styles.searchWrap}>
        <span className={styles.searchIcon}>⌕</span>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search tasks..."
          value={search}
          onChange={e => onChange({ ...filters, search: e.target.value })}
        />
        {search && (
          <button className={styles.clearSearch} onClick={() => onChange({ ...filters, search: '' })}>
            ×
          </button>
        )}
      </div>

      <select
        className={`${styles.select} ${priority !== 'all' ? styles.active : ''}`}
        value={priority}
        onChange={e => onChange({ ...filters, priority: e.target.value })}
      >
        {PRIORITIES.map(p => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>

      <select
        className={`${styles.select} ${dueFilter !== 'all' ? styles.active : ''}`}
        value={dueFilter}
        onChange={e => onChange({ ...filters, dueFilter: e.target.value })}
      >
        {DUE_FILTERS.map(d => (
          <option key={d.value} value={d.value}>{d.label}</option>
        ))}
      </select>

      <select
        className={`${styles.select} ${sortBy !== 'position' ? styles.active : ''}`}
        value={sortBy}
        onChange={e => onChange({ ...filters, sortBy: e.target.value })}
      >
        {SORT_OPTIONS.map(s => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      {isFiltering && (
        <>
          <span className={styles.results}>
            {totalResults} of {totalTasks}
          </span>
          <button className={styles.clearAll} onClick={handleClear}>
            Clear ×
          </button>
        </>
      )}
    </div>
  );
}