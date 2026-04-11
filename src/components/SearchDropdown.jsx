import './SearchDropdown.css';

function SearchDropdown({ results, onSelect }) {
  if (results.length === 0) {
    return (
      <div className="search-dropdown">
        <div className="search-dropdown__empty">No users found</div>
      </div>
    );
  }

  return (
    <div className="search-dropdown">
      {results.map((user, index) => (
        <div
          key={user.id}
          className={`search-dropdown__item ${index === 0 ? 'search-dropdown__item--highlighted' : ''}`}
          onClick={() => onSelect(user)}
        >
          <div className="search-dropdown__avatar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
          </div>
          <div className="search-dropdown__info">
            <span className="search-dropdown__username">{user.username}</span>
            <span className="search-dropdown__followers">{user.followers} followers</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SearchDropdown;
