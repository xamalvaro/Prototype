import { useState, useRef, useEffect } from 'react';
import SearchDropdown from './SearchDropdown';
import { users } from '../data/mockData';
import './TopBar.css';

function TopBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  const filteredUsers = searchQuery.trim().length > 0
    ? users.filter(u =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSearchChange(e) {
    setSearchQuery(e.target.value);
    setShowDropdown(e.target.value.trim().length > 0);
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
            onChange={handleSearchChange}
            onFocus={() => searchQuery.trim().length > 0 && setShowDropdown(true)}
          />
        </div>
        {showDropdown && (
          <SearchDropdown
            results={filteredUsers}
            onSelect={() => {
              setShowDropdown(false);
              setSearchQuery('');
            }}
          />
        )}
      </div>

      <div className="topbar__user">
        <span className="topbar__user-label">New user</span>
        <div className="topbar__avatar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
          </svg>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
