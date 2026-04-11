import './Messages.css';

function MessagesEmptyIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  );
}

function Messages() {
  return (
    <div className="messages">
      <div className="messages__conversations">
        <div className="messages__conversations-header">
          <h2 className="messages__title">Messages</h2>
        </div>
        <div className="messages__conversations-list">
          <div className="messages__empty-conversations">
            <div className="messages__empty-icon">
              <MessagesEmptyIcon />
            </div>
            <p className="messages__empty-text">No conversations yet</p>
            <p className="messages__empty-hint">Search for users to start messaging</p>
          </div>
        </div>
      </div>

      <div className="messages__thread">
        <div className="messages__thread-empty">
          <div className="messages__thread-empty-icon">
            <MessagesEmptyIcon />
          </div>
          <p className="messages__thread-empty-text">Select a conversation</p>
          <p className="messages__thread-empty-hint">Choose a conversation from the left or start a new one</p>
        </div>
      </div>
    </div>
  );
}

export default Messages;
