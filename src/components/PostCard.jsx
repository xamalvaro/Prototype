import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { likePost, unlikePost, subscribeToLike, deletePost, updatePost, createNotification } from '../firebase/firestore';
import AvatarInitials from './AvatarInitials';
import './PostCard.css';

function HeartIcon({ filled }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? '#ef4444' : 'none'} stroke={filled ? '#ef4444' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14H6L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4h6v2"/>
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}

function formatRelativeTime(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}

function PostCard({ post, showActions = true }) {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likesCount || 0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editLoading, setEditLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = currentUser && currentUser.uid === post.authorId;

  useEffect(() => {
    if (!currentUser) return;
    const unsub = subscribeToLike(currentUser.uid, post.id, (val) => {
      setLiked(val);
    });
    return unsub;
  }, [currentUser, post.id]);

  useEffect(() => {
    setLikeCount(post.likesCount || 0);
  }, [post.likesCount]);

  async function handleLike() {
    if (!currentUser || likeLoading) return;
    setLikeLoading(true);
    try {
      if (liked) {
        await unlikePost(currentUser.uid, post.id);
        setLikeCount((c) => c - 1);
      } else {
        await likePost(currentUser.uid, post.id);
        setLikeCount((c) => c + 1);
        if (post.authorId !== currentUser.uid) {
          await createNotification({
            userId: post.authorId,
            type: 'like',
            fromUserId: currentUser.uid,
            fromUsername: userProfile?.username || '',
            postId: post.id,
          });
        }
      }
    } catch (err) {
      console.error('Like error:', err);
    }
    setLikeLoading(false);
  }

  async function handleDelete() {
    if (!window.confirm('Delete this post?')) return;
    setDeleting(true);
    try {
      await deletePost(post.id);
    } catch (err) {
      console.error('Delete error:', err);
      setDeleting(false);
    }
  }

  async function handleEditSave() {
    if (!editContent.trim()) return;
    setEditLoading(true);
    try {
      await updatePost(post.id, editContent.trim());
      setEditing(false);
    } catch (err) {
      console.error('Edit error:', err);
    }
    setEditLoading(false);
  }

  const channel = post.id ? (post.id.charCodeAt(0) % 98) + 1 : 42;
  const isGif = post.mediaUrl && (post.mediaUrl.includes('.gif') || post.mediaUrl.includes('f_gif'));
  const useTV = post.mediaType === 'video' || isGif;

  return (
    <div className={`post-card${!post.mediaUrl ? ' post-card--text-only' : ''}`}>
      <div className="post-card__header">
        <Link to={`/profile/${post.authorUsername}`} className="post-card__author-link">
          <AvatarInitials username={post.authorUsername} displayName={post.authorDisplayName} size={32} avatarUrl={post.authorAvatarUrl} />
        </Link>
        <div className="post-card__author-info">
          <Link to={`/profile/${post.authorUsername}`} className="post-card__author-name">
            {post.authorDisplayName}
          </Link>
          <span className="post-card__author-username">@{post.authorUsername}</span>
        </div>
        <span className="post-card__timestamp">{formatRelativeTime(post.createdAt)}</span>
        {isOwner && (
          <div className="post-card__owner-actions">
            <button className="post-card__icon-btn" onClick={() => { setEditing(true); setEditContent(post.content); }} title="Edit">
              <EditIcon />
            </button>
            <button className="post-card__icon-btn post-card__icon-btn--danger" onClick={handleDelete} disabled={deleting} title="Delete">
              <TrashIcon />
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="post-card__edit">
          <textarea
            className="post-card__edit-textarea"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
          />
          <div className="post-card__edit-actions">
            <button className="post-card__edit-save" onClick={handleEditSave} disabled={editLoading}>
              {editLoading ? 'Saving...' : 'Save'}
            </button>
            <button className="post-card__edit-cancel" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <Link to={`/post/${post.id}`} className="post-card__content-link">
          <p className="post-card__content">{post.content}</p>
        </Link>
      )}

      {post.mediaUrl && (
        useTV ? (
          <div className="tv-frame">
            <div className="tv-cabinet">
              <div className="tv-antenna-left"></div>
              <div className="tv-antenna-right"></div>
              <div className="tv-screen-bezel">
                <div className="tv-screen">
                  {post.mediaType === 'image' ? (
                    <img src={post.mediaUrl} alt="post media" />
                  ) : (
                    <video src={post.mediaUrl} controls />
                  )}
                </div>
              </div>
              <div className="tv-controls">
                <div className="tv-knob"></div>
                <div className="tv-speaker">
                  <div className="tv-speaker-dot"></div>
                  <div className="tv-speaker-dot"></div>
                  <div className="tv-speaker-dot"></div>
                </div>
                <span className="tv-channel">CH {channel}</span>
                <div className="tv-speaker">
                  <div className="tv-speaker-dot"></div>
                  <div className="tv-speaker-dot"></div>
                  <div className="tv-speaker-dot"></div>
                </div>
                <div className="tv-knob"></div>
              </div>
            </div>
            <div className="tv-legs">
              <div className="tv-leg"></div>
              <div className="tv-leg"></div>
            </div>
          </div>
        ) : (
          <div className="post-card__photo">
            <img src={post.mediaUrl} alt="post media" className="post-card__photo-img" />
          </div>
        )
      )}

      {showActions && (
        <div className="post-card__footer">
          <div className="post-card__actions">
            <button
              className={`post-card__action-btn ${liked ? 'post-card__action-btn--liked' : ''}`}
              onClick={handleLike}
              disabled={likeLoading}
            >
              <HeartIcon filled={liked} />
              <span>{likeCount}</span>
            </button>
            <span className="post-card__actions-sep">◈</span>
            <Link to={`/post/${post.id}`} className="post-card__action-btn post-card__action-btn--comments">
              <CommentIcon />
              <span>{post.commentsCount || 0}</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export { formatRelativeTime };
export default PostCard;
