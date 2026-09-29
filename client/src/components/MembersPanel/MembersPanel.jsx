import { useState, useEffect } from 'react';
import { getMembers, inviteMember, removeMember } from '../../api/boards.js';
import { useAuth } from '../../context/useAuth.js';
import styles from './MembersPanel.module.css';

export default function MembersPanel({ boardId, board, onClose }) {
  const { user } = useAuth();
  const [members, setMembers]   = useState([]);
  const [email, setEmail]       = useState('');
  const [loading, setLoading]   = useState(true);
  const [inviting, setInviting] = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const isOwner = board?.createdBy === user?.id ||
    String(board?.createdBy) === String(user?.id);

  useEffect(() => {
    getMembers(boardId)
      .then(res => { setMembers(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [boardId]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setInviting(true);
    setError('');
    setSuccess('');
    try {
      const res = await inviteMember(boardId, email.trim());
      setMembers(prev => [...prev, res.data]);
      setEmail('');
      setSuccess(`${res.data.name} added successfully!`);
    } catch (err) {
      setError(err.message);
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (memberId) => {
    if (!window.confirm('Remove this member from the board?')) return;
    try {
      await removeMember(boardId, memberId);
      setMembers(prev => prev.filter(m => String(m.userId) !== String(memberId)));
    } catch (err) {
      setError(err.message);
    }
  };

  const initial = (name) => (name || '?').charAt(0).toUpperCase();

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <aside className={styles.panel}>
        <div className={styles.header}>
          <span className={styles.headerLabel}>BOARD MEMBERS</span>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        {isOwner && (
          <div className={styles.inviteSection}>
            <h3 className={styles.sectionTitle}>Invite Member</h3>
            <form className={styles.inviteForm} onSubmit={handleInvite}>
              <div className={styles.field}>
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="teammate@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              {error   && <p className={styles.error}>{error}</p>}
              {success && <p className={styles.success}>{success}</p>}
              <button
                type="submit"
                className={styles.inviteBtn}
                disabled={inviting}
              >
                {inviting ? 'Inviting...' : 'Send Invite →'}
              </button>
            </form>
          </div>
        )}

        <div className={styles.membersSection}>
          <h3 className={styles.sectionTitle}>
            Members ({members.length})
          </h3>

          {loading ? (
            <p className={styles.empty}>Loading...</p>
          ) : (
            <div className={styles.memberList}>
              {members.map(m => (
                <div key={String(m.userId)} className={styles.memberRow}>
                  <div className={styles.memberAvatar}>
                    {initial(m.name)}
                  </div>
                  <div className={styles.memberInfo}>
                    <span className={styles.memberName}>{m.name}</span>
                    <span className={styles.memberEmail}>{m.email}</span>
                  </div>
                  <span className={`${styles.roleBadge} ${styles[m.role]}`}>
                    {m.role}
                  </span>
                  {isOwner && m.role !== 'owner' && (
                    <button
                      className={styles.removeBtn}
                      onClick={() => handleRemove(m.userId)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}