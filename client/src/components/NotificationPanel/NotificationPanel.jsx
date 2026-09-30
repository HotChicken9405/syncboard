import { useNotifications } from '../../hooks/useNotifications.js';
import styles from './NotificationPanel.module.css';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function NotificationPanel({ onClose }) {
  const {
    notifications, loading, unreadCount,
    markRead, markAllRead, accept, decline,
  } = useNotifications();

  const initial = (name) => (name || '?').charAt(0).toUpperCase();

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <aside className={styles.panel}>
        <div className={styles.header}>
          <span className={styles.headerLabel}>NOTIFICATIONS</span>
          <div className={styles.headerActions}>
            {unreadCount > 0 && (
              <button className={styles.readAllBtn} onClick={markAllRead}>
                Mark all read
              </button>
            )}
            <button className={styles.closeBtn} onClick={onClose}>×</button>
          </div>
        </div>

        <div className={styles.list}>
          {loading && <p className={styles.empty}>Loading...</p>}
          {!loading && notifications.length === 0 && (
            <p className={styles.empty}>No notifications yet.</p>
          )}
          {notifications.map(n => (
            <div
              key={n._id}
              className={`${styles.item} ${!n.read ? styles.unread : ''}`}
              onClick={() => !n.read && markRead(n._id)}
            >
              <div className={styles.avatar}>{initial(n.fromUser?.name)}</div>
              <div className={styles.content}>
                <p className={styles.message}>
                  <strong>{n.fromUser?.name}</strong> {n.message}
                </p>
                {n.boardName && (
                  <p className={styles.boardName}>{n.boardName}</p>
                )}
                <p className={styles.time}>{timeAgo(n.createdAt)}</p>

                {/* Invite actions */}
                {n.type === 'board_invite' && n.status === 'pending' && (
                  <div className={styles.actions}>
                    <button
                      className={styles.acceptBtn}
                      onClick={(e) => { e.stopPropagation(); accept(n._id); }}
                    >
                      Accept
                    </button>
                    <button
                      className={styles.declineBtn}
                      onClick={(e) => { e.stopPropagation(); decline(n._id); }}
                    >
                      Decline
                    </button>
                  </div>
                )}

                {n.type === 'board_invite' && n.status === 'accepted' && (
                  <span className={styles.statusBadge + ' ' + styles.accepted}>Accepted</span>
                )}
                {n.type === 'board_invite' && n.status === 'declined' && (
                  <span className={styles.statusBadge + ' ' + styles.declined}>Declined</span>
                )}
              </div>
              {!n.read && <div className={styles.dot} />}
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}