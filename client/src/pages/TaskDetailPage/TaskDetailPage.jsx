import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { mockTasks } from '../../data/mockTasks.js';
import Button from '../../components/Button/Button.jsx';
import styles from './TaskDetailPage.module.css';

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const found = mockTasks.find(t => t.id === id);
    setTask(found || null);
    setLoading(false);
  }, [id]);

  if (loading) return <div className={styles.center}>Loading...</div>;
  if (!task) return (
    <div className={styles.center}>
      <h2>Task not found</h2>
      <Button variant="primary" onClick={() => navigate('/')}>Back to Board</Button>
    </div>
  );

  return (
    <div className={styles.container}>
      <Button variant="primary" size="sm" onClick={() => navigate('/')}>← Back</Button>
      <h1>{task.title}</h1>
      <div className={styles.details}>
        <p><strong>Assignee:</strong> {task.assignee}</p>
        <p><strong>Status:</strong> {task.status}</p>
        <p><strong>Due:</strong> {task.dueDate}</p>
        <p><strong>Priority:</strong> <span className={styles[task.priority]}>{task.priority}</span></p>
      </div>
    </div>
  );
}