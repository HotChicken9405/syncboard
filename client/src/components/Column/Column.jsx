import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from '../TaskCard/TaskCard.jsx';
import styles from './Column.module.css';

export default function Column({ id, title, tasks, boardId, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const taskIds = tasks.map(t => String(t._id || t.id));

  return (
    <section className={`${styles.column} ${isOver ? styles.over : ''}`}>
      <h2 className={styles.header}>
        {title}
        <span className={styles.count}>{tasks.length}</span>
      </h2>
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className={styles.tasks} ref={setNodeRef}>
          {tasks.map(task => (
            <TaskCard
              key={String(task._id || task.id)}
              task={task}
              boardId={boardId}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </section>
  );
}