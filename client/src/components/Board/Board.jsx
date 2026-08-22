import { useState, useEffect } from 'react';
import Column from '../Column/Column.jsx';
import { getTasks, updateTask, deleteTask } from '../../api/tasks.js';
import styles from './Board.module.css';

const COLUMNS = [
  { id: 'todo', title: 'To Do' },
  { id: 'doing', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

export default function Board() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getTasks()
      .then(data => {
        setTasks(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleMove = (id, direction) => {
    const statusOrder = ['todo', 'doing', 'done'];
    const task = tasks.find(t => t.id === id);
    const currentIndex = statusOrder.indexOf(task.status);
    const newStatus = statusOrder[currentIndex + direction];

    if (!newStatus) return;

    updateTask(id, { status: newStatus }).then(updated => {
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
    });
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this task?')) return;
    deleteTask(id).then(() => {
      setTasks(prev => prev.filter(t => t.id !== id));
    });
  };

  if (loading) return <div className={styles.center}>Loading...</div>;
  if (error) return <div className={styles.center}>Error: {error}</div>;

  const doneCount = tasks.filter(t => t.status === 'done').length;

  return (
    <div className={styles.board}>
      <h1>SyncBoard</h1>
      <p className={styles.stats}>{doneCount} of {tasks.length} done</p>
      <div className={styles.columns}>
        {COLUMNS.map(col => (
          <Column
            key={col.id}
            title={col.title}
            tasks={tasks.filter(t => t.status === col.id)}
            onMoveLeft={(id) => handleMove(id, -1)}
            onMoveRight={(id) => handleMove(id, 1)}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}