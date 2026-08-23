import { Link } from 'react-router-dom';
import Button from '../Button/Button.jsx';
import styles from './TaskCard.module.css';

export default function TaskCard({ task, onMoveLeft, onMoveRight, onDelete }) {
  const statusOrder = ['todo', 'doing', 'done'];
  const currentIndex = statusOrder.indexOf(task.status);
  const id = task._id || task.id;

  return (
    <article className={styles.card}>
      <Link to={`/tasks/${id}`} className={styles.link}>
        <h3 className={styles.title}>{task.title}</h3>
        <p className={styles.meta}>{task.assignee} · Due {task.dueDate}</p>
        <span className={`${styles.badge} ${styles[task.priority]}`}>{task.priority}</span>
      </Link>
      <div className={styles.actions}>
        <Button variant="primary" size="sm" disabled={currentIndex === 0} onClick={() => onMoveLeft(id)}>
          ←
        </Button>
        <Button variant="danger" size="sm" onClick={() => onDelete(id)}>
          Delete
        </Button>
        <Button variant="primary" size="sm" disabled={currentIndex === 2} onClick={() => onMoveRight(id)}>
          →
        </Button>
      </div>
    </article>
  );
}