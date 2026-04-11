import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { markAllNotificationsRead, markNotificationRead } from '../firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import AvatarInitials from './AvatarInitials';
import './Notifications.css';

function formatRelativeTime(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function notifText(notif) {
  switch (notif.type) {
    case 'follow': return 'started following you';
    case 'like': return 'liked your post';
    case 'comment': return 'commented on your post';
    default: return '';
  }
}

function Notifications({ notifications, onClose }) {
  const { currentUser } = useAuth();
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  async function handleMarkAll() {
    if (!currentUser) return;
    await markAllNotificationsRead(currentUser.uid);
  }

  async function handleNotifClick(notif) {
    if (!notif.read) {
      await markNotificationRead(notif.id);
    }
    onClose();
  }

  return (
    <div className="notifications-panel" ref={ref}>
      <div className="notifications-panel__header">
        <span className="notifications-panel__title">Notifications</span>
        <button className="notifications-panel__mark-all" onClick={handleMarkAll}>
          Mark all read
        </button>
      </div>
      <div className="notifications-panel__list">
        {notifications.length === 0 && (
          <div className="notifications-panel__empty">No notifications yet</div>
        )}
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`notifications-panel__item ${!notif.read ? 'notifications-panel__item--unread' : ''}`}
            onClick={() => handleNotifClick(notif)}
          >
            <AvatarInitials username={notif.fromUsername} displayName={notif.fromUsername} size={34} />
            <div className="notifications-panel__item-body">
              <span className="notifications-panel__item-text">
                <Link
                  to={`/profile/${notif.fromUsername}`}
                  className="notifications-panel__item-user"
                  onClick={(e) => e.stopPropagation()}
                >
                  @{notif.fromUsername}
                </Link>
                {' '}{notifText(notif)}
                {notif.postId && (
                  <>
                    {' — '}
                    <Link
                      to={`/post/${notif.postId}`}
                      className="notifications-panel__item-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      view post
                    </Link>
                  </>
                )}
              </span>
              <span className="notifications-panel__item-time">{formatRelativeTime(notif.createdAt)}</span>
            </div>
            {!notif.read && <span className="notifications-panel__dot" />}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Notifications;
