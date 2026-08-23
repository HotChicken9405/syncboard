import { useAuth } from '../../context/AuthContext.jsx';
import Column from '../Column/Column.jsx';
import AddTaskForm from '../AddTaskForm/AddTaskForm.jsx';
import { useTasks } from '../../hooks/useTasks.js';
import styles from './Board.module.css';

const COLUMNS = [
  { id: 'todo', title: 'To Do' },
  { id: 'doing', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

export default function Board() {
  const { logout } = useAuth();
  const { state, addTask, moveTask, removeTask } = useTasks();

  if (state.loading) return <div className={styles.center}>Loading...</div>;
  if (state.error) return <div className={styles.center}>Error: {state.error}</div>;

  const doneCount = state.tasks.filter(t => t.status === 'done').length;

  return (
    <div className={styles.board}>
      <div className={styles.header}>
        <h1>SyncBoard</h1>
        <div>
          {!navigator.onLine && <span className={styles.offline}>Offline</span>}
          <button onClick={logout} className={styles.logout}>Logout</button>
        </div>
      </div>
      <p className={styles.stats}>{doneCount} of {state.tasks.length} done</p>
      <AddTaskForm onAdd={addTask} />
      <div className={styles.columns}>
        {COLUMNS.map(col => (
          <Column
            key={col.id}
            title={col.title}
            tasks={state.tasks.filter(t => t.status === col.id)}
            onMoveLeft={(id) => {
              const task = state.tasks.find(t => (t._id || t.id) === id);
              moveTask(id, 'todo', task?.version);
            }}
            onMoveRight={(id) => {
              const task = state.tasks.find(t => (t._id || t.id) === id);
              moveTask(id, 'done', task?.version);
            }}
            onDelete={removeTask}
          />
        ))}
      </div>
    </div>
  );
}