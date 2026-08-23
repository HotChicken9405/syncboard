import { useReducer, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import Column from '../Column/Column.jsx';
import AddTaskForm from '../AddTaskForm/AddTaskForm.jsx';
import { tasksReducer, initialState } from '../../reducers/tasksReducer.js';
import { getTasks, createTask, updateTask, deleteTask } from '../../api/tasks.js';
import styles from './Board.module.css';

const COLUMNS = [
  { id: 'todo', title: 'To Do' },
  { id: 'doing', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

export default function Board() {
  const [state, dispatch] = useReducer(tasksReducer, initialState);
  const { logout } = useAuth();

  useEffect(() => {
    getTasks()
      .then(res => dispatch({ type: 'loaded', tasks: res.data }))
      .catch(err => dispatch({ type: 'error', error: err.message }));
  }, []);

  const handleAdd = (task) => {
    createTask(task).then(res => {
      dispatch({ type: 'added', task: res.data });
    });
  };

    const handleMove = (id, direction) => {
    const statusOrder = ['todo', 'doing', 'done'];
    const task = state.tasks.find(t => (t._id || t.id) === id);
    const currentIndex = statusOrder.indexOf(task.status);
    const newStatus = statusOrder[currentIndex + direction];

    if (!newStatus) return;

    updateTask(id, { status: newStatus }).then(() => {
      dispatch({ type: 'moved', id, status: newStatus });
    });
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this task?')) return;
    deleteTask(id).then(() => {
      dispatch({ type: 'deleted', id });
    });
  };

  if (state.loading) return <div className={styles.center}>Loading...</div>;
  if (state.error) return <div className={styles.center}>Error: {state.error}</div>;

  const doneCount = state.tasks.filter(t => t.status === 'done').length;

  return (
    <div className={styles.board}>
      <div className={styles.header}>
        <h1>SyncBoard</h1>
        <button onClick={logout} className={styles.logout}>Logout</button>
      </div>
      <p className={styles.stats}>{doneCount} of {state.tasks.length} done</p>
      <AddTaskForm onAdd={handleAdd} />
      <div className={styles.columns}>
        {COLUMNS.map(col => (
          <Column
            key={col.id}
            title={col.title}
            tasks={state.tasks.filter(t => t.status === col.id)}
            onMoveLeft={(id) => handleMove(id, -1)}
            onMoveRight={(id) => handleMove(id, 1)}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}