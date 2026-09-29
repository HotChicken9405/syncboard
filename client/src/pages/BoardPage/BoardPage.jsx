import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useAuth } from '../../context/useAuth.js';
import { getBoards } from '../../api/boards.js';
import { reorderTasks } from '../../api/tasks.js';
import { useColumns } from '../../hooks/useColumns.js';
import { useTasks } from '../../hooks/useTasks.js';
import { useBoardSocket } from '../../hooks/useBoardSocket.js';
import { useFilteredTasks } from '../../hooks/useFilteredTasks.js';
import Column from '../../components/Column/Column.jsx';
import AddTaskForm from '../../components/AddTaskForm/AddTaskForm.jsx';
import TaskCard from '../../components/TaskCard/TaskCard.jsx';
import AccountSidebar from '../../components/AccountSidebar/AccountSidebar.jsx';
import MembersPanel from '../../components/MembersPanel/MembersPanel.jsx';
import SearchFilterBar from '../../components/SearchFilterBar/SearchFilterBar.jsx';
import styles from './BoardPage.module.css';

const DEFAULT_FILTERS = {
  search: '', priority: 'all', dueFilter: 'all', sortBy: 'position',
};

export default function BoardPage() {
  const { boardId }  = useParams();
  const navigate     = useNavigate();
  const { logout, user } = useAuth();
  const { state, dispatch, addTask, moveTask, removeTask, online } = useTasks(boardId);
  const { columns, loading: colLoading, addColumn, renameColumn, removeColumn, setColumns } = useColumns(boardId);

  const [board, setBoard]               = useState(null);
  const [activeTask, setActiveTask]     = useState(null);
  const [showAccount, setShowAccount]   = useState(false);
  const [showMembers, setShowMembers]   = useState(false);
  const [addingCol, setAddingCol]       = useState(false);
  const [newColName, setNewColName]     = useState('');
  const [filters, setFilters]           = useState(DEFAULT_FILTERS);
  const [presence, setPresence]         = useState([]);

  const filteredTasks = useFilteredTasks(state.tasks, filters);

  const socketHandlers = useCallback(() => ({
    'task:created': (task) => {
      dispatch({ type: 'added', task });
    },
    'task:updated': (task) => {
      dispatch({ type: 'moved', id: String(task._id), columnId: task.columnId, version: task.version });
    },
    'task:deleted': ({ taskId }) => {
      dispatch({ type: 'deleted', id: taskId });
    },
    'task:reordered': ({ orderedIds }) => {
      dispatch({ type: 'socket:reordered', orderedIds });
    },
    'column:created': (column) => {
      setColumns(prev => [...prev, column]);
    },
    'column:updated': (column) => {
      setColumns(prev => prev.map(c => c._id === column._id ? column : c));
    },
    'column:deleted': ({ columnId }) => {
      setColumns(prev => prev.filter(c => c._id !== columnId));
    },
    'column:reordered': ({ orderedIds }) => {
      setColumns(prev => {
        const map = Object.fromEntries(prev.map(c => [c._id, c]));
        return orderedIds.map(id => map[id]).filter(Boolean);
      });
    },
    'board:presence': (users) => {
      setPresence(users.filter(u => u.userId !== user?.id));
    },
    'board:member_added': ({ member }) => {
      // Optionally show a toast notification
      console.log(`${member.name} joined the board`);
    },
    'board:member_removed': ({ userId: removedId }) => {
      if (removedId === user?.id) {
        // We were removed — go back to boards list
        navigate('/');
      }
    },
  }), [dispatch, setColumns, user?.id, navigate]);

  useBoardSocket(boardId, user?.name || user?.email || 'Anonymous', socketHandlers());

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

    const overColumn  = columns.find(c => c._id === over.id);
    const overTask    = !overColumn
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
          {presence.length > 0 && (
            <div className={styles.presence}>
              {presence.slice(0, 5).map((u, i) => (
                <div key={i} className={styles.presenceAvatar} title={u.name}>
                  {(u.name || '?').charAt(0).toUpperCase()}
                </div>
              ))}
              {presence.length > 5 && (
                <div className={styles.presenceMore}>+{presence.length - 5}</div>
              )}
            </div>
          )}
          {!online && <span className={styles.offline}>Offline</span>}
          <span className={styles.stats}>{doneCount}/{state.tasks.length} done</span>
          <button className={styles.membersBtn} onClick={() => setShowMembers(true)}>
            Members
          </button>
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

        <SearchFilterBar
          filters={filters}
          onChange={setFilters}
          totalResults={filteredTasks.length}
          totalTasks={state.tasks.length}
        />

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
                tasks={filteredTasks.filter(t => String(t.columnId) === String(col._id))}
                boardId={boardId}
                onDeleteTask={removeTask}
                onRename={renameColumn}
                onDeleteColumn={removeColumn}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask && (
              <TaskCard task={activeTask} boardId={boardId} columnName="" isDragging onDelete={() => {}} />
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {showMembers && (
        <MembersPanel
          boardId={boardId}
          board={board}
          onClose={() => setShowMembers(false)}
        />
      )}
      {showAccount && <AccountSidebar onClose={() => setShowAccount(false)} />}
    </div>
  );
}