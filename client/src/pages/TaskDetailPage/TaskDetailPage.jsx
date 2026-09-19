import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getTasks, updateTask } from '../../api/tasks.js';
import { getColumns } from '../../api/columns.js';
import { getComments, addComment, deleteComment, getActivity } from '../../api/comments.js';
import styles from './TaskDetailPage.module.css';

export default function TaskDetailPage() {
  const { id, boardId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [task, setTask]         = useState(null);
  const [columns, setColumns]   = useState([]);
  const [loading, setLoading]   = useState(true);

  const [description, setDescription]   = useState('');
  const [editingDesc, setEditingDesc]   = useState(false);
  const [savingDesc, setSavingDesc]     = useState(false);

  const [comments, setComments]                   = useState([]);
  const [activity, setActivity]                   = useState([]);
  const [commentText, setCommentText]             = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const descRef = useRef(null);

  useEffect(() => {
    Promise.all([
      getTasks(boardId),
      getColumns(boardId),
      getComments(boardId, id),
      getActivity(boardId, id),
    ]).then(([tasksRes, colsRes, commentsRes, activityRes]) => {
      const found = tasksRes.data.find(t => (t._id || t.id) === id);
      setTask(found || null);
      setDescription(found?.description || '');
      setColumns(colsRes.data);
      setComments(commentsRes.data);
      setActivity(activityRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id, boardId]);

  const getColumnName = (columnId) => {
    const col = columns.find(c => String(c._id) === String(columnId));
    return col ? col.name : '—';
  };

  const timeline = [
    ...comments.map(c => ({ ...c, _type: 'comment' })),
    ...activity.map(a => ({ ...a, _type: 'activity' })),
  ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const handleSaveDescription = async () => {
    if (!task) return;
    setSavingDesc(true);
    try {
      await updateTask(boardId, task._id || task.id, {
        description,
        version: task.version || 1,
      });
      setTask(prev => ({ ...prev, description }));
      setEditingDesc(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingDesc(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await addComment(boardId, id, commentText.trim());
      setComments(prev => [...prev, res.data]);
      setCommentText('');
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    await deleteComment(boardId, id, commentId);
    setComments(prev => prev.filter(c => c._id !== commentId));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const initial = (name) => (name || '?').charAt(0).toUpperCase();

  const priorityColors = {
    low:    { bg: '#d1fae5', color: '#065f46' },
    normal: { bg: '#dbeafe', color: '#1e40af' },
    high:   { bg: '#fee2e2', color: '#991b1b' },
  };

  if (loading) return (
    <div className={styles.page}>
      <div className={styles.center}>Loading...</div>
    </div>
  );

  if (!task) return (
    <div className={styles.page}>
      <div className={styles.center}>
        <p className={styles.notFoundLabel}>404 — TASK NOT FOUND</p>
        <button className={styles.backBtn} onClick={() => navigate(`/boards/${boardId}`)}>
          ← Back to Board
        </button>
      </div>
    </div>
  );

  const p = priorityColors[task.priority] || priorityColors.normal;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(`/boards/${boardId}`)}>
          ← Back
        </button>
        <span className={styles.headerMeta}>TASK DETAIL</span>
      </header>

      <div className={styles.body}>
        <div className={styles.container}>

          <div className={styles.titleRow}>
            <span className={styles.stepBadge}>— DETAILS</span>
            <h1 className={styles.title}>{task.title}</h1>
          </div>

          <div className={styles.grid}>
            <div className={styles.cell}>
              <span className={styles.cellLabel}>Assignee</span>
              <span className={styles.cellValue}>{task.assignee || '—'}</span>
            </div>
            <div className={styles.cell}>
              <span className={styles.cellLabel}>Column</span>
              <span className={styles.cellValue}>{getColumnName(task.columnId)}</span>
            </div>
            <div className={styles.cell}>
              <span className={styles.cellLabel}>Due Date</span>
              <span className={styles.cellValue}>{formatDate(task.dueDate)}</span>
            </div>
            <div className={styles.cell}>
              <span className={styles.cellLabel}>Priority</span>
              <span
                className={styles.priorityBadge}
                style={{ background: p.bg, color: p.color }}
              >
                {task.priority?.toUpperCase() || 'NORMAL'}
              </span>
            </div>
          </div>

          <div className={styles.descSection}>
            <div className={styles.descHeader}>
              <span className={styles.sectionLabel}>DESCRIPTION</span>
              {!editingDesc && (
                <button
                  className={styles.editBtn}
                  onClick={() => {
                    setEditingDesc(true);
                    setTimeout(() => descRef.current?.focus(), 50);
                  }}
                >
                  {description ? 'Edit' : '+ Add'}
                </button>
              )}
            </div>

            {editingDesc ? (
              <div className={styles.descEditWrap}>
                <textarea
                  ref={descRef}
                  className={styles.descTextarea}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Add a description..."
                  rows={5}
                />
                <div className={styles.descActions}>
                  <button
                    className={styles.saveBtn}
                    onClick={handleSaveDescription}
                    disabled={savingDesc}
                  >
                    {savingDesc ? 'Saving...' : 'Save →'}
                  </button>
                  <button
                    className={styles.cancelDescBtn}
                    onClick={() => {
                      setDescription(task.description || '');
                      setEditingDesc(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p
                className={`${styles.descText} ${!description ? styles.descEmpty : ''}`}
                onClick={() => {
                  setEditingDesc(true);
                  setTimeout(() => descRef.current?.focus(), 50);
                }}
              >
                {description || 'Click to add a description...'}
              </p>
            )}
          </div>

          <div className={styles.timelineSection}>
            <span className={styles.sectionLabel}>ACTIVITY & COMMENTS</span>

            <div className={styles.timeline}>
              {timeline.length === 0 && (
                <p className={styles.emptyTimeline}>No activity yet.</p>
              )}
              {timeline.map((item) => (
                <div key={item._id} className={styles.timelineItem}>
                  <div className={styles.timelineAvatar}>
                    {initial(item.author?.name)}
                  </div>
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineMeta}>
                      <span className={styles.timelineAuthor}>{item.author?.name}</span>
                      <span className={styles.timelineDate}>{formatTime(item.createdAt)}</span>
                    </div>
                    {item._type === 'comment' ? (
                      <div className={styles.commentBubble}>
                        <p className={styles.commentText}>{item.text}</p>
                        {item.author?.id === user?.id && (
                          <button
                            className={styles.deleteCommentBtn}
                            onClick={() => handleDeleteComment(item._id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className={styles.activityText}>{item.action}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <form className={styles.commentForm} onSubmit={handleAddComment}>
              <div className={styles.commentAvatar}>
                {initial(user?.name)}
              </div>
              <div className={styles.commentInputWrap}>
                <input
                  type="text"
                  className={styles.commentInput}
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                />
                <button
                  type="submit"
                  className={styles.commentSubmit}
                  disabled={!commentText.trim() || submittingComment}
                >
                  →
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
