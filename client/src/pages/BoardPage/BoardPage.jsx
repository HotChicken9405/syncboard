import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useAuth } from '../../context/AuthContext.jsx';
import { getBoards } from '../../api/boards.js';
import { reorderTasks } from '../../api/tasks.js';
import Column from '../../components/Column/Column.jsx';
import AddTaskForm from '../../components/AddTaskForm/AddTaskForm.jsx';
import TaskCard from '../../components/TaskCard/TaskCard.jsx';
import AccountSidebar from '../../components/AccountSidebar/AccountSidebar.jsx';
import { useTasks } from '../../hooks/useTasks.js';
import styles from './BoardPage.module.css';

const COLUMNS = [
  { id: 'todo', title: 'To Do' },
  { id: 'doing', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

export default function BoardPage() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { state, dispatch, addTask, moveTask, removeTask, online } = useTasks(boardId);
  const [board, setBoard] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [showAccount, setShowAccount] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  }));

  useEffect(() => {
    getBoards()
      .then(res => {
        const found = res.data.find(b => b._id === boardId);
        setBoard(found || null);
      })
      .catch(() => {});
  }, [boardId]);

  const handleDragStart = (event) => {
    const task = state.tasks.find(t => String(t._id || t.id) === String(event.active.id));
    setActiveTask(task || null);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const taskId = String(active.id);
    const task = state.tasks.find(t => String(t._id || t.id) === taskId);
    if (!task) return;

    const overColumn = COLUMNS.find(c => c.id === over.id);
    const overTask = !overColumn
      ? state.tasks.find(t => String(t._id || t.id) === String(over.id))
      : null;

    const newStatus = overColumn?.id || overTask?.status;

    if (newStatus && newStatus !== task.status) {
      // Moving to a different column
      moveTask(taskId, newStatus, task.version || 1);

      // Save order for destination column
      const destTasks = state.tasks
        .filter(t => t.status === newStatus && String(t._id || t.id) !== taskId)
        .map(t => String(t._id || t.id));
      reorderTasks(boardId, [taskId, ...destTasks]);

    } else if (overTask && task.status === overTask.status) {
      // Reordering within the same column
      const columnTasks = state.tasks.filter(t => t.status === task.status);
      const oldIndex = columnTasks.findIndex(t => String(t._id || t.id) === taskId);
      const newIndex = columnTasks.findIndex(t => String(t._id || t.id) === String(over.id));

      if (oldIndex !== newIndex) {
        const reordered = arrayMove(columnTasks, oldIndex, newIndex);
        const orderedIds = reordered.map(t => String(t._id || t.id));

        // Optimistic update
        dispatch({ type: 'reordered', tasks: reordered, status: task.status });

        // Persist to server
        reorderTasks(boardId, orderedIds);
      }
    }
  };

  if (state.loading) return (
    <div className={styles.page}>
      <div className={styles.center}>Loading...</div>
    </div>
  );

  if (state.error) return (
    <div className={styles.page}>
      <div className={styles.center}>Error: {state.error}</div>
    </div>
  );

  const doneCount = state.tasks.filter(t => t.status === 'done').length;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => navigate('/')}>
            ← Boards
          </button>
          <div className={styles.boardInfo}>
            {board && (
              <span
                className={styles.boardDot}
                style={{ background: board.color }}
              />
            )}
            <h1 className={styles.boardName}>{board?.name || 'Board'}</h1>
          </div>
        </div>
        <div className={styles.headerRight}>
          {!online && <span className={styles.offline}>Offline</span>}
          <span className={styles.stats}>{doneCount}/{state.tasks.length} done</span>
          <button className={styles.logoutBtn} onClick={logout}>Logout</button>
          <button
            className={styles.avatarBtn}
            onClick={() => setShowAccount(true)}
          >
            {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
          </button>
        </div>
      </header>

      <div className={styles.body}>
        <AddTaskForm onAdd={addTask} />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className={styles.columns}>
            {COLUMNS.map(col => {
              const tasks = state.tasks.filter(t => t.status === col.id);
              return (
                <Column
                  key={col.id}
                  id={col.id}
                  title={col.title}
                  tasks={tasks}
                  boardId={boardId}
                  onDelete={removeTask}
                />
              );
            })}
          </div>

          <DragOverlay>
            {activeTask && (
              <TaskCard
                task={activeTask}
                boardId={boardId}
                isDragging
                onDelete={() => {}}
              />
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {showAccount && <AccountSidebar onClose={() => setShowAccount(false)} />}
    </div>
  );
}
