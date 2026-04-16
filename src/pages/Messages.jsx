import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  getMutualFollows,
  getUserByUid,
  subscribeToConversations,
  subscribeToMessages,
  getOrCreateConversation,
  sendMessage,
  markConversationRead,
} from '../firebase/firestore';
import { uploadMedia } from '../utils/cloudinary';
import AvatarInitials from '../components/AvatarInitials';
import { formatRelativeTime } from '../components/PostCard';
import './Messages.css';

const ACCEPTED_MEDIA_TYPES = 'image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm';
const MAX_MEDIA_SIZE = 50 * 1024 * 1024;

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  );
}

function MessagesEmptyIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  );
}

function Messages() {
  const { conversationId: paramConvId } = useParams();
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(paramConvId || null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [sendLoading, setSendLoading] = useState(false);

  const [mutualUsers, setMutualUsers] = useState([]);
  const [showNewMsg, setShowNewMsg] = useState(false);
  const [newMsgLoading, setNewMsgLoading] = useState(false);

  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState(null);
  const [mediaUploading, setMediaUploading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const mediaInputRef = useRef(null);

  // Load mutual follows for new message
  useEffect(() => {
    if (!currentUser) return;
    getMutualFollows(currentUser.uid).then(async (ids) => {
      const users = await Promise.all(ids.map((id) => getUserByUid(id)));
      setMutualUsers(users.filter(Boolean));
    });
  }, [currentUser]);

  // Subscribe to conversations
  useEffect(() => {
    if (!currentUser) return;
    const unsub = subscribeToConversations(currentUser.uid, setConversations);
    return unsub;
  }, [currentUser]);

  // Subscribe to messages for active conversation
  useEffect(() => {
    if (!activeConvId) {
      setMessages([]);
      return;
    }
    if (currentUser) {
      markConversationRead(activeConvId, currentUser.uid).catch(() => {});
    }
    const unsub = subscribeToMessages(activeConvId, setMessages);
    return unsub;
  }, [activeConvId, currentUser]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Sync URL param
  useEffect(() => {
    if (paramConvId && paramConvId !== activeConvId) {
      setActiveConvId(paramConvId);
    }
  }, [paramConvId]);

  function selectConversation(convId) {
    setActiveConvId(convId);
    navigate(`/messages/${convId}`, { replace: true });
  }

  async function startConversationWith(otherUser) {
    if (!currentUser || !userProfile || newMsgLoading) return;
    setNewMsgLoading(true);
    try {
      const convId = await getOrCreateConversation(
        currentUser.uid,
        userProfile.username,
        otherUser.uid,
        otherUser.username
      );
      setShowNewMsg(false);
      selectConversation(convId);
    } catch (err) {
      console.error('Start conversation error:', err);
    }
    setNewMsgLoading(false);
  }

  function handleMediaSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_MEDIA_SIZE) {
      alert('File too large. Maximum size is 50MB.');
      return;
    }
    setMediaFile(file);
    setMediaPreviewUrl(URL.createObjectURL(file));
  }

  function removeMedia() {
    setMediaFile(null);
    if (mediaPreviewUrl) {
      URL.revokeObjectURL(mediaPreviewUrl);
      setMediaPreviewUrl(null);
    }
    if (mediaInputRef.current) mediaInputRef.current.value = '';
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!messageText.trim() && !mediaFile) return;
    if (!currentUser || !activeConvId || sendLoading) return;

    const conv = conversations.find((c) => c.id === activeConvId);
    if (!conv) return;
    const recipientId = conv.participants.find((p) => p !== currentUser.uid);
    if (!recipientId) return;

    setSendLoading(true);
    let uploadedUrl = null;
    let uploadedType = null;

    try {
      if (mediaFile) {
        setMediaUploading(true);
        const result = await uploadMedia(mediaFile);
        uploadedUrl = result.url;
        uploadedType = result.mediaType;
        setMediaUploading(false);
      }

      await sendMessage(
        activeConvId,
        currentUser.uid,
        userProfile?.username || '',
        messageText.trim(),
        recipientId,
        uploadedUrl,
        uploadedType
      );
      setMessageText('');
      removeMedia();
      if (inputRef.current) inputRef.current.focus();
    } catch (err) {
      console.error('Send message error:', err);
      setMediaUploading(false);
    }
    setSendLoading(false);
  }

  function getOtherParticipant(conv) {
    if (!currentUser) return { username: 'Unknown', displayName: 'Unknown' };
    const otherId = conv.participants.find((p) => p !== currentUser.uid);
    const otherUsername = conv.participantUsernames?.[otherId] || 'unknown';
    return { username: otherUsername, displayName: otherUsername, uid: otherId };
  }

  const activeConv = conversations.find((c) => c.id === activeConvId);
  const otherParticipant = activeConv ? getOtherParticipant(activeConv) : null;

  return (
    <div className="messages">
      <div className="messages__conversations">
        <div className="messages__conversations-header">
          <h2 className="messages__title">Messages</h2>
          <button
            className="messages__new-btn"
            onClick={() => setShowNewMsg((v) => !v)}
            title="New message"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>

        {showNewMsg && (
          <div className="messages__new-panel">
            <p className="messages__new-hint">
              {mutualUsers.length === 0
                ? 'No mutual follows yet. Follow someone and get a follow-back to message them.'
                : 'Select a mutual follow to message:'}
            </p>
            {mutualUsers.map((user) => (
              <button
                key={user.uid}
                className="messages__new-user"
                onClick={() => startConversationWith(user)}
                disabled={newMsgLoading}
              >
                <AvatarInitials username={user.username} displayName={user.displayName} size={30} />
                <span className="messages__new-user-name">{user.displayName}</span>
                <span className="messages__new-user-handle">@{user.username}</span>
              </button>
            ))}
          </div>
        )}

        <div className="messages__conversations-list">
          {conversations.length === 0 && !showNewMsg && (
            <div className="messages__empty-conversations">
              <div className="messages__empty-icon"><MessagesEmptyIcon /></div>
              <p className="messages__empty-text">No conversations yet</p>
              <p className="messages__empty-hint">Click + to start messaging</p>
            </div>
          )}
          {conversations.map((conv) => {
            const other = getOtherParticipant(conv);
            const unread = conv.unreadCount?.[currentUser?.uid] || 0;
            const isActive = conv.id === activeConvId;
            return (
              <button
                key={conv.id}
                className={`messages__conv-item ${isActive ? 'messages__conv-item--active' : ''}`}
                onClick={() => selectConversation(conv.id)}
              >
                <AvatarInitials username={other.username} displayName={other.displayName} size={38} />
                <div className="messages__conv-info">
                  <span className="messages__conv-name">{other.displayName || other.username}</span>
                  <span className="messages__conv-preview">{conv.lastMessage || 'No messages yet'}</span>
                </div>
                {unread > 0 && (
                  <span className="messages__conv-unread">{unread}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="messages__thread">
        {!activeConvId || !activeConv ? (
          <div className="messages__thread-empty">
            <div className="messages__thread-empty-icon"><MessagesEmptyIcon /></div>
            <p className="messages__thread-empty-text">Select a conversation</p>
            <p className="messages__thread-empty-hint">Choose from the left or click + to start one</p>
          </div>
        ) : (
          <>
            <div className="messages__thread-header">
              {otherParticipant && (
                <>
                  <AvatarInitials username={otherParticipant.username} displayName={otherParticipant.displayName} size={36} />
                  <div className="messages__thread-header-info">
                    <span className="messages__thread-header-name">{otherParticipant.displayName || otherParticipant.username}</span>
                    <span className="messages__thread-header-handle">@{otherParticipant.username}</span>
                  </div>
                </>
              )}
            </div>

            <div className="messages__thread-messages">
              {messages.length === 0 && (
                <div className="messages__thread-no-messages">
                  No messages yet. Say hello!
                </div>
              )}
              {messages.map((msg) => {
                const isOwn = msg.senderId === currentUser?.uid;
                return (
                  <div
                    key={msg.id}
                    className={`messages__message ${isOwn ? 'messages__message--own' : ''}`}
                  >
                    {!isOwn && (
                      <AvatarInitials username={msg.senderUsername} displayName={msg.senderUsername} size={28} />
                    )}
                    <div className="messages__message-bubble-wrap">
                      <div className="messages__message-bubble">
                        {msg.content}
                        {msg.mediaUrl && (
                          msg.mediaType === 'video' ? (
                            <video src={msg.mediaUrl} controls className="message-media-video" />
                          ) : (
                            <img src={msg.mediaUrl} alt="media" className="message-media-img" />
                          )
                        )}
                      </div>
                      <span className="messages__message-time">
                        {formatRelativeTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="messages__input-area">
              {mediaUploading && (
                <div className="messages__media-uploading">UPLOADING...</div>
              )}
              {!mediaUploading && mediaPreviewUrl && (
                <div className="messages__media-preview">
                  {mediaFile?.type?.startsWith('video/') ? (
                    <video src={mediaPreviewUrl} className="messages__media-preview-thumb" />
                  ) : (
                    <img src={mediaPreviewUrl} alt="preview" className="messages__media-preview-thumb" />
                  )}
                  <span className="messages__media-preview-name">{mediaFile?.name}</span>
                  <button type="button" className="messages__media-preview-remove" onClick={removeMedia}>✕</button>
                </div>
              )}
              <form className="messages__thread-input" onSubmit={handleSendMessage}>
                <button
                  type="button"
                  className="messages__attachment-btn"
                  onClick={() => mediaInputRef.current?.click()}
                  title="Attach media"
                >
                  📎
                </button>
                <input
                  ref={mediaInputRef}
                  type="file"
                  accept={ACCEPTED_MEDIA_TYPES}
                  onChange={handleMediaSelect}
                  style={{ display: 'none' }}
                />
                <input
                  ref={inputRef}
                  type="text"
                  className="messages__thread-input-field"
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
                <button
                  type="submit"
                  className="messages__thread-send-btn"
                  disabled={(!messageText.trim() && !mediaFile) || sendLoading || mediaUploading}
                >
                  <SendIcon />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Messages;
