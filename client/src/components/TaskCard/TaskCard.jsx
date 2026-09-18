import { Link } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styles from './TaskCard.module.css';

export default function TaskCard({ task, boardId, onDelete, isDragging = false }) {
  const id = String(task._id || task.id);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityClass = { low: styles.low, normal: styles.normal, high: styles.high }[task.priority] || styles.normal;

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`${styles.card} ${isSortableDragging ? styles.dragging : ''} ${isDragging ? styles.overlay : ''}`}
    >
      {/* Drag handle only — doesn't wrap the link */}
      <div
        className={styles.dragHandle}
        {...attributes}
        {...listeners}
        onClick={e => e.preventDefault()}
      >
        ⠿
      </div>

      <Link to={`/boards/${boardId}/tasks/${id}`} className={styles.link}>
        <h3 className={styles.title}>{task.title}</h3>
        <p className={styles.meta}>
          {task.assignee} · Due {task.dueDate
            ? new Date(task.dueDate).toLocaleDateString()
            : '—'}
        </p>
        <span className={`${styles.badge} ${priorityClass}`}>{task.priority}</span>
      </Link>

      <button className={styles.deleteBtn} onClick={() => onDelete(id)}>×</button>
    </article>
  );
}