import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  subscribeToPost,
  subscribeToComments,
  addComment,
  deleteComment,
  likePost,
  unlikePost,
  subscribeToLike,
  createNotification,
} from '../firebase/firestore';
import AvatarInitials from '../components/AvatarInitials';
import { formatRelativeTime } from '../components/PostCard';
import './PostDetail.css';

function HeartIcon({ filled }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? '#ef4444' : 'none'} stroke={filled ? '#ef4444' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14H6L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4h6v2"/>
    </svg>
  );
}

function PostDetail() {
  const { id } = useParams();
  const { currentUser, userProfile } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubPost = subscribeToPost(id, (data) => {
      setPost(data);
      if (data) setLikeCount(data.likesCount || 0);
      setLoading(false);
    });
    const unsubComments = subscribeToComments(id, setComments);
    return () => {
      unsubPost();
      unsubComments();
    };
  }, [id]);

  useEffect(() => {
    if (!currentUser) return;
    const unsub = subscribeToLike(currentUser.uid, id, setLiked);
    return unsub;
  }, [currentUser, id]);

  useEffect(() => {
    if (post) setLikeCount(post.likesCount || 0);
  }, [post]);

  async function handleLike() {
    if (!currentUser || likeLoading) return;
    setLikeLoading(true);
    try {
      if (liked) {
        await unlikePost(currentUser.uid, id);
      } else {
        await likePost(currentUser.uid, id);
        if (post && post.authorId !== currentUser.uid) {
          await createNotification({
            userId: post.authorId,
            type: 'like',
            fromUserId: currentUser.uid,
            fromUsername: userProfile?.username || '',
            postId: id,
          });
        }
      }
    } catch (err) {
      console.error('Like error:', err);
    }
    setLikeLoading(false);
  }

  async function handleAddComment(e) {
    e.preventDefault();
    if (!commentText.trim() || !currentUser || commentLoading) return;
    setCommentLoading(true);
    try {
      await addComment(
        id,
        currentUser.uid,
        userProfile?.username || '',
        userProfile?.displayName || '',
        commentText.trim()
      );
      if (post && post.authorId !== currentUser.uid) {
        await createNotification({
          userId: post.authorId,
          type: 'comment',
          fromUserId: currentUser.uid,
          fromUsername: userProfile?.username || '',
          postId: id,
        });
      }
      setCommentText('');
    } catch (err) {
      console.error('Comment error:', err);
    }
    setCommentLoading(false);
  }

  async function handleDeleteComment(commentId) {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteComment(commentId, id);
    } catch (err) {
      console.error('Delete comment error:', err);
    }
  }

  if (loading) {
    return (
      <div className="post-detail-wrapper">
        <div className="post-detail">
          <div className="post-detail--loading">Loading post...</div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="post-detail post-detail--not-found">
        <p>Post not found.</p>
        <Link to="/">Go back home</Link>
      </div>
    );
  }

  return (
    <div className="post-detail-wrapper">
      <div className="post-detail">
        <Link to="/" className="post-detail__back">
          <BackIcon />
          Back to feed
        </Link>

        <div className="post-detail__card">
          <div className="post-detail__author-row">
            <Link to={`/profile/${post.authorUsername}`}>
              <AvatarInitials username={post.authorUsername} displayName={post.authorDisplayName} size={40} />
            </Link>
            <div className="post-detail__author-info">
              <Link to={`/profile/${post.authorUsername}`} className="post-detail__author-name">
                {post.authorDisplayName}
              </Link>
              <span className="post-detail__author-handle">@{post.authorUsername}</span>
            </div>
            <span className="post-detail__timestamp">{formatRelativeTime(post.createdAt)}</span>
          </div>

          <p className="post-detail__content">{post.content}</p>

          <div className="post-detail__actions">
            <button
              className={`post-detail__action-btn ${liked ? 'post-detail__action-btn--liked' : ''}`}
              onClick={handleLike}
              disabled={likeLoading}
            >
              <HeartIcon filled={liked} />
              <span>{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</span>
            </button>
          </div>

          <div className="post-detail__discussion">
            <h3 className="post-detail__discussion-title">Comments ({comments.length})</h3>

            <form className="post-detail__comment-form" onSubmit={handleAddComment}>
              <AvatarInitials
                username={userProfile?.username}
                displayName={userProfile?.displayName}
                size={32}
              />
              <input
                type="text"
                className="post-detail__comment-input"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button
                type="submit"
                className="post-detail__comment-submit"
                disabled={!commentText.trim() || commentLoading}
              >
                {commentLoading ? '...' : 'Post'}
              </button>
            </form>

            <div className="post-detail__comments">
              {comments.length === 0 && (
                <div className="post-detail__no-comments">No comments yet. Be the first!</div>
              )}
              {comments.map((comment) => (
                <div key={comment.id} className="comment">
                  <div className="comment__header">
                    <Link to={`/profile/${comment.authorUsername}`}>
                      <AvatarInitials username={comment.authorUsername} displayName={comment.authorDisplayName} size={28} />
                    </Link>
                    <div className="comment__meta">
                      <Link to={`/profile/${comment.authorUsername}`} className="comment__author">
                        {comment.authorDisplayName}
                      </Link>
                      <span className="comment__time">{formatRelativeTime(comment.createdAt)}</span>
                    </div>
                    {currentUser && currentUser.uid === comment.authorId && (
                      <button
                        className="comment__delete-btn"
                        onClick={() => handleDeleteComment(comment.id)}
                        title="Delete comment"
                      >
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                  <p className="comment__text">{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostDetail;
