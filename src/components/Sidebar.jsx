import { NavLink } from 'react-router-dom';
import './Sidebar.css';

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
      <polyline points="9 21 9 12 15 12 15 21"/>
    </svg>
  );
}

function MessagesIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  );
}

function CreateIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="16"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none"/>
    </svg>
  );
}

function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="sidebar__nav">
        <NavLink to="/" end className={({ isActive }) => `sidebar__item ${isActive ? 'sidebar__item--active' : ''}`}>
          <HomeIcon />
          <span className="sidebar__label">Home</span>
        </NavLink>
        <NavLink to="/messages" className={({ isActive }) => `sidebar__item ${isActive ? 'sidebar__item--active' : ''}`}>
          <MessagesIcon />
          <span className="sidebar__label">Messages</span>
        </NavLink>
        <NavLink to="/create" className={({ isActive }) => `sidebar__item ${isActive ? 'sidebar__item--active' : ''}`}>
          <CreateIcon />
          <span className="sidebar__label">Create</span>
        </NavLink>
      </div>
      <div className="sidebar__bottom">
        <div className="sidebar__item sidebar__item--more">
          <MoreIcon />
          <span className="sidebar__label">More</span>
        </div>
      </div>
    </nav>
  );
}

export default Sidebar;
