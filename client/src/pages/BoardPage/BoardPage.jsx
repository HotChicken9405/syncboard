import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useAuth } from '../../context/AuthContext.jsx';
import { getBoards } from '../../api/boards.js';
import { reorderTasks } from '../../api/tasks.js';
import { useColumns } from '../../hooks/useColumns.js';
import { useTasks } from '../../hooks/useTasks.js';
import Column from '../../components/Column/Column.jsx';
import AddTaskForm from '../../components/AddTaskForm/AddTaskForm.jsx';
import TaskCard from '../../components/TaskCard/TaskCard.jsx';
import AccountSidebar from '../../components/AccountSidebar/AccountSidebar.jsx';
import styles from './BoardPage.module.css';

export default function BoardPage() {
  const { boardId }  = useParams();
  const navigate     = useNavigate();
  const { logout, user } = useAuth();
  const { state, dispatch, addTask, moveTask, removeTask, online } = useTasks(boardId);
  const { columns, loading: colLoading, addColumn, renameColumn, removeColumn } = useColumns(boardId);

  const [board, setBoard]             = useState(null);
  const [activeTask, setActiveTask]   = useState(null);
  const [showAccount, setShowAccount] = useState(false);
  const [addingCol, setAddingCol]     = useState(false);
  const [newColName, setNewColName]   = useState('');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    getBoards()
      .then(res => setBoard(res.data.find(b => b._id === boardId) || null))
      .catch(() => {});
  }, [boardId]);

  const handleAddColumn = async (e) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    await addColumn(newColName.trim());
    setNewColName('');
    setAddingCol(false);
  };

  const handleDragStart = (event) => {
    const task = state.tasks.find(t => String(t._id || t.id) === String(event.active.id));
    setActiveTask(task || null);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const taskId = String(active.id);
    const task   = state.tasks.find(t => String(t._id || t.id) === taskId);
    if (!task) return;

    const overColumn = columns.find(c => c._id === over.id);
    const overTask   = !overColumn
      ? state.tasks.find(t => String(t._id || t.id) === String(over.id))
      : null;

    const newColumnId = overColumn?._id || overTask?.columnId;
    if (!newColumnId) return;

    if (String(newColumnId) !== String(task.columnId)) {
      moveTask(taskId, newColumnId, task.version || 1);
      const destTasks = state.tasks
        .filter(t => String(t.columnId) === String(newColumnId) && String(t._id || t.id) !== taskId)
        .map(t => String(t._id || t.id));
      reorderTasks(boardId, [taskId, ...destTasks]);
    } else if (overTask) {
      const colTasks = state.tasks.filter(t => String(t.columnId) === String(task.columnId));
      const oldIndex = colTasks.findIndex(t => String(t._id || t.id) === taskId);
      const newIndex = colTasks.findIndex(t => String(t._id || t.id) === String(over.id));

      if (oldIndex !== newIndex) {
        const reordered  = arrayMove(colTasks, oldIndex, newIndex);
        const orderedIds = reordered.map(t => String(t._id || t.id));
        dispatch({ type: 'reordered', tasks: reordered, columnId: String(task.columnId) });
        reorderTasks(boardId, orderedIds);
      }
    }
  };

  if (state.loading || colLoading) return (
    <div className={styles.page}><div className={styles.center}>Loading...</div></div>
  );

  if (state.error) return (
    <div className={styles.page}><div className={styles.center}>Error: {state.error}</div></div>
  );

  const doneColumn = columns.find(c => c.name.toLowerCase() === 'done');
  const doneCount  = doneColumn
    ? state.tasks.filter(t => String(t.columnId) === String(doneColumn._id)).length
    : 0;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => navigate('/')}>← Boards</button>
          <div className={styles.boardInfo}>
            {board && <span className={styles.boardDot} style={{ background: board.color }} />}
            <h1 className={styles.boardName}>{board?.name || 'Board'}</h1>
          </div>
        </div>
        <div className={styles.headerRight}>
          {!online && <span className={styles.offline}>Offline</span>}
          <span className={styles.stats}>{doneCount}/{state.tasks.length} done</span>
          <button className={styles.logoutBtn} onClick={logout}>Logout</button>
          <button className={styles.avatarBtn} onClick={() => setShowAccount(true)}>
            {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
          </button>
        </div>
      </header>

      <div className={styles.body}>
        <div className={styles.topBar}>
          <AddTaskForm onAdd={addTask} columns={columns} />
          {addingCol ? (
            <form className={styles.addColForm} onSubmit={handleAddColumn}>
              <input
                className={styles.addColInput}
                value={newColName}
                onChange={e => setNewColName(e.target.value)}
                placeholder="Column name"
                autoFocus
              />
              <div className={styles.addColActions}>
                <button type="submit" className={styles.addColSave}>Add →</button>
                <button type="button" className={styles.addColCancel} onClick={() => setAddingCol(false)}>×</button>
              </div>
            </form>
          ) : (
            <button className={styles.addColBtn} onClick={() => setAddingCol(true)}>
              + Add Column
            </button>
          )}
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className={styles.columns}>
            {columns.map(col => (
              <Column
                key={col._id}
                id={col._id}
                title={col.name}
                tasks={state.tasks.filter(t => String(t.columnId) === String(col._id))}
                boardId={boardId}
                onDeleteTask={removeTask}
                onRename={renameColumn}
                onDeleteColumn={removeColumn}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask && (
              <TaskCard task={activeTask} boardId={boardId} isDragging onDelete={() => {}} />
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {showAccount && <AccountSidebar onClose={() => setShowAccount(false)} />}
    </div>
  );
}
