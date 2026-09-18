import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getTasks } from '../../api/tasks.js';
import styles from './TaskDetailPage.module.css';

export default function TaskDetailPage() {
  const { id, boardId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTasks(boardId)
      .then(res => {
        const found = res.data.find(t => (t._id || t.id) === id);
        setTask(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, boardId]);

  if (loading) return (
    <div className={styles.page}>
      <div className={styles.center}>Loading...</div>
    </div>
  );

  if (!task) return (
    <div className={styles.page}>
      <div className={styles.center}>
        <p className={styles.notFoundLabel}>404 — TASK NOT FOUND</p>
        <button className={styles.backBtn} onClick={() => navigate(`/boards/${boardId}`)}>
          ← Back to Board
        </button>
      </div>
    </div>
  );

  const priorityColors = {
    low:    { bg: '#d1fae5', color: '#065f46' },
    normal: { bg: '#dbeafe', color: '#1e40af' },
    high:   { bg: '#fee2e2', color: '#991b1b' },
  };
  const p = priorityColors[task.priority] || priorityColors.normal;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(`/boards/${boardId}`)}>
          ← Back
        </button>
        <span className={styles.headerMeta}>TASK DETAIL</span>
      </header>

      <div className={styles.body}>
        <div className={styles.container}>

          <div className={styles.titleRow}>
            <span className={styles.stepBadge}>— DETAILS</span>
            <h1 className={styles.title}>{task.title}</h1>
          </div>

          <div className={styles.grid}>
            <div className={styles.cell}>
              <span className={styles.cellLabel}>Assignee</span>
              <span className={styles.cellValue}>{task.assignee}</span>
            </div>

            <div className={styles.cell}>
              <span className={styles.cellLabel}>Status</span>
              <span className={styles.cellValue}>{task.status.toUpperCase()}</span>
            </div>

            <div className={styles.cell}>
              <span className={styles.cellLabel}>Due Date</span>
              <span className={styles.cellValue}>
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric'
                }) : '—'}
              </span>
            </div>

            <div className={styles.cell}>
              <span className={styles.cellLabel}>Priority</span>
              <span
                className={styles.priorityBadge}
                style={{ background: p.bg, color: p.color }}
              >
                {task.priority.toUpperCase()}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
