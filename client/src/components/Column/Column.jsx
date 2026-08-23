import TaskCard from '../TaskCard/TaskCard.jsx';
import styles from './Column.module.css';

export default function Column({ title, tasks, onMoveLeft, onMoveRight, onDelete }) {
  return (
    <section className={styles.column}>
      <h2 className={styles.header}>
        {title}
        <span className={styles.count}>{tasks.length}</span>
      </h2>
      <div className={styles.tasks}>
        {tasks.map(task => (
          <TaskCard
            key={task._id || task.id}
            task={task}
            onMoveLeft={onMoveLeft}
            onMoveRight={onMoveRight}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  );
}