import { useState } from 'react';
import Button from '../Button/Button.jsx';
import styles from './AddTaskForm.module.css';

export default function AddTaskForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('normal');
  const [error, setError] = useState('');

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
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3>Add New Task</h3>
      {error && <p className={styles.error}>{error}</p>}
      <input
        type="text"
        placeholder="Task title (min 3 chars)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Assignee"
        value={assignee}
        onChange={(e) => setAssignee(e.target.value)}
      />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        required
      />
      <select value={priority} onChange={(e) => setPriority(e.target.value)}>
        <option value="low">Low</option>
        <option value="normal">Normal</option>
        <option value="high">High</option>
      </select>
      <Button variant="primary" size="md" type="submit">Add Task</Button>
    </form>
  );
}