import { Link } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styles from './TaskCard.module.css';

function getDueStatus(dueDate, columnName) {
  if (!dueDate) return null;
  if (columnName?.toLowerCase() === 'done') return null;

  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due   = new Date(dueDate);
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const diffMs   = dueDay - today;
  const diffDays = Math.round(diffMs / 86400000);

  if (diffDays < 0)  return { type: 'overdue',  label: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''}` };
  if (diffDays === 0) return { type: 'today',   label: 'Due Today' };
  if (diffDays <= 7)  return { type: 'soon',    label: `Due in ${diffDays} day${diffDays > 1 ? 's' : ''}` };
  return null;
}

function formatDueDate(dueDate) {
  if (!dueDate) return null;
  return new Date(dueDate).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function TaskCard({ task, boardId, columnName, onDelete, isDragging = false }) {
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

  const priorityClass = {
    low: styles.low, normal: styles.normal, high: styles.high,
  }[task.priority] || styles.normal;

  const dueStatus = getDueStatus(task.dueDate, columnName);

  const cardClass = [
    styles.card,
    dueStatus?.type === 'overdue' ? styles.cardOverdue : '',
    dueStatus?.type === 'today'   ? styles.cardToday   : '',
    dueStatus?.type === 'soon'    ? styles.cardSoon     : '',
    isSortableDragging            ? styles.dragging     : '',
    isDragging                    ? styles.overlay      : '',
  ].filter(Boolean).join(' ');

  return (
    <article ref={setNodeRef} style={style} className={cardClass}>
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
          {task.assignee}
          {task.dueDate && (
            <span className={dueStatus ? styles[`due_${dueStatus.type}`] : styles.dueNormal}>
              {' · '}
              {dueStatus ? dueStatus.label : formatDueDate(task.dueDate)}
            </span>
          )}
        </p>
        <div className={styles.footer}>
          <span className={`${styles.badge} ${priorityClass}`}>{task.priority}</span>
          {dueStatus && (
            <span className={`${styles.dueBadge} ${styles[`dueBadge_${dueStatus.type}`]}`}>
              {dueStatus.label}
            </span>
          )}
        </div>
      </Link>

      <button className={styles.deleteBtn} onClick={() => onDelete(id)}>×</button>
    </article>
  );
}