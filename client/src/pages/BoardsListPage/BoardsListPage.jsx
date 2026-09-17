import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getBoards, createBoard, deleteBoard } from '../../api/boards.js';
import styles from './BoardsListPage.module.css';

const COLORS = ['#d52b1e', '#2563eb', '#7c3aed', '#059669', '#d97706', '#db2777'];

export default function BoardsListPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [error, setError] = useState('');

  useEffect(() => {
    getBoards()
      .then(res => { setBoards(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const res = await createBoard({ name: name.trim(), description: description.trim(), color });
      setBoards(prev => [res.data, ...prev]);
      setName(''); setDescription(''); setColor(COLORS[0]);
      setShowForm(false);
    } catch (err) { setError(err.message); }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this board and all its tasks?')) return;
    await deleteBoard(id);
    setBoards(prev => prev.filter(b => b._id !== id));
  };

  if (loading) return <div className={styles.page}><div className={styles.center}>Loading...</div></div>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.logo}>SyncBoard</h1>
          <span className={styles.meta}>YOUR WORKSPACE</span>
        </div>
        <button className={styles.logoutBtn} onClick={logout}>Logout</button>
      </header>

      <main className={styles.main}>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>Your Boards</h2>
          <button className={styles.newBtn} onClick={() => setShowForm(true)}>
            + New Board
          </button>
        </div>

        {showForm && (
          <form className={styles.form} onSubmit={handleCreate}>
            <h3 className={styles.formTitle}>Create New Board</h3>
            {error && <p className={styles.formError}>{error}</p>}
            <div className={styles.formField}>
              <label>Board Name</label>
              <input
                type="text"
                placeholder="e.g. Website Redesign"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className={styles.formField}>
              <label>Description (optional)</label>
              <input
                type="text"
                placeholder="What is this board for?"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
            <div className={styles.formField}>
              <label>Color</label>
              <div className={styles.colorPicker}>
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    className={`${styles.colorDot} ${color === c ? styles.colorSelected : ''}`}
                    style={{ background: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </div>
            <div className={styles.formActions}>
              <button type="submit" className={styles.createBtn}>Create Board</button>
              <button type="button" className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        )}

        {boards.length === 0 && !showForm ? (
          <div className={styles.empty}>
            <p>No boards yet. Create your first one!</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {boards.map(board => (
              <div
                key={board._id}
                className={styles.card}
                onClick={() => navigate(`/boards/${board._id}`)}
                style={{ '--board-color': board.color }}
              >
                <div className={styles.cardTop} style={{ background: board.color }}>
                  <span className={styles.cardInitial}>
                    {board.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardName}>{board.name}</h3>
                  {board.description && (
                    <p className={styles.cardDesc}>{board.description}</p>
                  )}
                  <p className={styles.cardDate}>
                    {new Date(board.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  className={styles.deleteBtn}
                  onClick={(e) => handleDelete(e, board._id)}
                >×</button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}