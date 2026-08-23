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

const STATUS_ORDER = ['todo', 'doing', 'done'];

export default function Board() {
  const { logout } = useAuth();
  const { state, addTask, moveTask, removeTask, online } = useTasks();

  if (state.loading) return <div className={styles.center}>Loading...</div>;
  if (state.error) return <div className={styles.center}>Error: {state.error}</div>;

  const doneCount = state.tasks.filter(t => t.status === 'done').length;

  const handleMove = (id, direction) => {
    const task = state.tasks.find(t => (t._id || t.id) === id);
    if (!task) return;
    
    const currentIndex = STATUS_ORDER.indexOf(task.status);
    const newIndex = currentIndex + direction;
    const newStatus = STATUS_ORDER[newIndex];
    
    if (!newStatus) return;
    
    moveTask(id, newStatus, task.version || 1);
  };

  return (
    <div className={styles.board}>
      <div className={styles.header}>
        <h1>SyncBoard</h1>
        <div>
          {!online && <span className={styles.offline}>Offline</span>}
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
            onMoveLeft={(id) => handleMove(id, -1)}
            onMoveRight={(id) => handleMove(id, 1)}
            onDelete={removeTask}
          />
        ))}
      </div>
    </div>
  );
}