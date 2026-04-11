import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from '../firebase/auth';
import { searchUsers, subscribeToNotifications } from '../firebase/firestore';
import AvatarInitials from './AvatarInitials';
import Notifications from './Notifications';
import './TopBar.css';

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  );
}

function TopBar() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Real-time notifications
  useEffect(() => {
    if (!currentUser) return;
    const unsub = subscribeToNotifications(currentUser.uid, setNotifications);
    return unsub;
  }, [currentUser]);

  // Search users by prefix
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    const unsub = searchUsers(searchQuery.trim(), (results) => {
      setSearchResults(results);
      setShowDropdown(results.length > 0 || searchQuery.trim().length > 0);
    });
    return unsub;
  }, [searchQuery]);

  // Click outside handlers
  useEffect(() => {
    function handler(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleSelectUser(user) {
    setShowDropdown(false);
    setSearchQuery('');
    navigate(`/profile/${user.username}`);
  }

  async function handleSignOut() {
    try {
      await signOut();
      navigate('/signin');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  }

  return (
    <header className="topbar">
      <div className="topbar__logo">NEWSPACE</div>

      <div className="topbar__search-wrapper" ref={searchRef}>
        <div className="topbar__search">
          <span className="topbar__search-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            className="topbar__search-input"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
          />
        </div>
        {showDropdown && (
          <div className="search-dropdown">
            {searchResults.length === 0 ? (
              <div className="search-dropdown__empty">No users found</div>
            ) : (
              searchResults.map((user) => (
                <div
                  key={user.uid}
                  className="search-dropdown__item"
                  onClick={() => handleSelectUser(user)}
                >
                  <AvatarInitials username={user.username} displayName={user.displayName} size={32} />
                  <div className="search-dropdown__info">
                    <span className="search-dropdown__username">{user.displayName}</span>
                    <span className="search-dropdown__followers">@{user.username}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="topbar__right">
        {currentUser && (
          <div className="topbar__notif-wrapper" ref={notifRef}>
            <button
              className="topbar__notif-btn"
              onClick={() => setShowNotifications((v) => !v)}
            >
              <BellIcon />
              {unreadCount > 0 && (
                <span className="topbar__notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>
            {showNotifications && (
              <Notifications
                notifications={notifications}
                onClose={() => setShowNotifications(false)}
              />
            )}
          </div>
        )}

        <div className="topbar__user-wrapper" ref={userMenuRef}>
          <div className="topbar__user" onClick={() => setShowUserMenu((v) => !v)}>
            <span className="topbar__user-label">
              {userProfile ? `@${userProfile.username}` : 'Loading...'}
            </span>
            {userProfile ? (
              <AvatarInitials
                username={userProfile.username}
                displayName={userProfile.displayName}
                size={36}
              />
            ) : (
              <div className="topbar__avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              </div>
            )}
          </div>
          {showUserMenu && (
            <div className="topbar__user-menu">
              {userProfile && (
                <button
                  className="topbar__user-menu-item"
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate(`/profile/${userProfile.username}`);
                  }}
                >
                  View Profile
                </button>
              )}
              <button className="topbar__user-menu-item topbar__user-menu-item--danger" onClick={handleSignOut}>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default TopBar;
