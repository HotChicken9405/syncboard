import { useState } from 'react';
import styles from './AddTaskForm.module.css';

export default function AddTaskForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('normal');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (title.trim().length < 3) {
      setError('Title must be at least 3 characters');
      return;
    }

    const selectedDate = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setError('Due date cannot be in the past');
      return;
    }

    onAdd({
      title: title.trim(),
      assignee: assignee.trim() || 'Unassigned',
      status: 'todo',
      dueDate,
      priority,
    });

    setTitle('');
    setAssignee('');
    setDueDate('');
    setPriority('normal');
    setOpen(false);
  };

  if (!open) {
    return (
      <button className={styles.trigger} onClick={() => setOpen(true)}>
        + New Task
      </button>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formHeader}>
        <span className={styles.badge}>NEW TASK</span>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={() => setOpen(false)}
        >
          ×
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.field}>
        <label>Title</label>
        <input
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={e => setTitle(e.target.value)}
          autoFocus
          required
        />
      </div>

      <div className={styles.field}>
        <label>Assignee</label>
        <input
          type="text"
          placeholder="Who is responsible?"
          value={assignee}
          onChange={e => setAssignee(e.target.value)}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label>Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            required
          />
        </div>

        <div className={styles.field}>
          <label>Priority</label>
          <select
            value={priority}
            onChange={e => setPriority(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.submitBtn}>
          Add Task →
        </button>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={() => setOpen(false)}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
