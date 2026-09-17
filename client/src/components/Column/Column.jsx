import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from '../TaskCard/TaskCard.jsx';
import styles from './Column.module.css';

export default function Column({ id, title, tasks, boardId, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <section
      className={`${styles.column} ${isOver ? styles.over : ''}`}
      ref={setNodeRef}
    >
      <h2 className={styles.header}>
        {title}
        <span className={styles.count}>{tasks.length}</span>
      </h2>
      <SortableContext
        items={tasks.map(t => t._id || t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={styles.tasks}>
          {tasks.map(task => (
            <TaskCard
              key={task._id || task.id}
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