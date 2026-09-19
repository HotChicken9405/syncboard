import { useState, useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from '../TaskCard/TaskCard.jsx';
import styles from './Column.module.css';

export default function Column({ id, title, tasks, boardId, onDeleteTask, onRename, onDeleteColumn }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const [editing, setEditing] = useState(false);
  const [name, setName]       = useState(title);
  const inputRef              = useRef(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const handleRename = async () => {
    if (!name.trim() || name === title) {
      setName(title);
      setEditing(false);
      return;
    }
    await onRename(id, name.trim());
    setEditing(false);
  };

  const handleDeleteColumn = () => {
    if (tasks.length > 0) {
      alert(`Move or delete the ${tasks.length} task${tasks.length > 1 ? 's' : ''} in "${title}" first.`);
      return;
    }
    if (window.confirm(`Delete column "${title}"?`)) {
      onDeleteColumn(id);
    }
  };

  const taskIds = tasks.map(t => String(t._id || t.id));

  return (
    <section className={`${styles.column} ${isOver ? styles.over : ''}`}>
      <div className={styles.header}>
        {editing ? (
          <input
            ref={inputRef}
            className={styles.renameInput}
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={e => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') { setName(title); setEditing(false); }
            }}
          />
        ) : (
          <h2
            className={styles.title}
            onDoubleClick={() => setEditing(true)}
            title="Double-click to rename"
          >
            {title}
            <span className={styles.count}>{tasks.length}</span>
          </h2>
        )}
        <button
          className={styles.deleteColBtn}
          onClick={handleDeleteColumn}
          title="Delete column"
        >
          ×
        </button>
      </div>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className={styles.tasks} ref={setNodeRef}>
          {tasks.map(task => (
            <TaskCard
              key={String(task._id || task.id)}
              task={task}
              boardId={boardId}
              onDelete={onDeleteTask}
            />
          ))}
        </div>
      </SortableContext>

      {tasks.length === 0 && (
        <p className={styles.empty}>Drop tasks here</p>
      )}
    </section>
  );
}
