import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { updateProfile, changePassword, deleteAccount } from '../../api/auth.js';
import styles from './AccountSidebar.module.css';

export default function AccountSidebar({ onClose }) {
  const { user, logout, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordErr, setPasswordErr] = useState('');

  const [confirmDelete, setConfirmDelete] = useState('');
  const [deleteErr, setDeleteErr] = useState('');

  const handleProfile = async (e) => {
    e.preventDefault();
    setProfileMsg(''); setProfileErr('');
    try {
      const res = await updateProfile({ name });
      updateUser(res.data);
      setProfileMsg('Profile updated!');
    } catch (err) { setProfileErr(err.message); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg(''); setPasswordErr('');
    try {
      await changePassword({ currentPassword, newPassword });
      setPasswordMsg('Password changed!');
      setCurrentPassword(''); setNewPassword('');
    } catch (err) { setPasswordErr(err.message); }
  };

  const handleDelete = async () => {
    if (confirmDelete !== 'DELETE') {
      setDeleteErr('Type DELETE to confirm');
      return;
    }
    try {
      await deleteAccount();
      logout();
    } catch (err) { setDeleteErr(err.message); }
  };

  const initial = (user?.name || user?.email || '?').charAt(0).toUpperCase();

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <aside className={styles.sidebar}>

        <div className={styles.sidebarHeader}>
          <span className={styles.headerLabel}>ACCOUNT</span>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        {/* Avatar + identity */}
        <div className={styles.identity}>
          <div className={styles.avatar}>{initial}</div>
          <div className={styles.identityInfo}>
            <p className={styles.identityName}>{user?.name}</p>
            <p className={styles.identityEmail}>{user?.email}</p>
          </div>
        </div>

        <div className={styles.sections}>

          {/* Profile */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Profile</h3>
            <form className={styles.form} onSubmit={handleProfile}>
              <div className={styles.field}>
                <label>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>
                <label>Email Address</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className={styles.disabled}
                />
              </div>
              {profileErr && <p className={styles.error}>{profileErr}</p>}
              {profileMsg && <p className={styles.success}>{profileMsg}</p>}
              <button type="submit" className={styles.btn}>Save Changes →</button>
            </form>
          </section>

          {/* Password */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Change Password</h3>
            <form className={styles.form} onSubmit={handlePassword}>
              <div className={styles.field}>
                <label>Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className={styles.field}>
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                />
              </div>
              {passwordErr && <p className={styles.error}>{passwordErr}</p>}
              {passwordMsg && <p className={styles.success}>{passwordMsg}</p>}
              <button type="submit" className={styles.btn}>Update Password →</button>
            </form>
          </section>

          {/* Danger Zone */}
          <section className={`${styles.section} ${styles.danger}`}>
            <h3 className={styles.sectionTitleDanger}>Danger Zone</h3>
            <p className={styles.dangerDesc}>
              This will permanently delete your account, all boards and all tasks. This cannot be undone.
            </p>
            <div className={styles.field}>
              <label>Type DELETE to confirm</label>
              <input
                type="text"
                value={confirmDelete}
                onChange={e => setConfirmDelete(e.target.value)}
                placeholder="DELETE"
              />
            </div>
            {deleteErr && <p className={styles.error}>{deleteErr}</p>}
            <button
              className={styles.deleteBtn}
              onClick={handleDelete}
              disabled={confirmDelete !== 'DELETE'}
            >
              Delete My Account
            </button>
          </section>

        </div>
      </aside>
    </>
  );
}