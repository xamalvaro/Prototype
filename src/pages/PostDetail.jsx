import { useParams, Link } from 'react-router-dom';
import { posts, followerNotifications } from '../data/mockData';
import './PostDetail.css';

function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
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

function CommentThread({ comment, depth = 0 }) {
  return (
    <div className={`comment ${depth > 0 ? 'comment--nested' : ''}`} style={{ marginLeft: depth * 24 + 'px' }}>
      <div className="comment__header">
        <div className="comment__avatar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
          </svg>
        </div>
        <span className="comment__author">{comment.author}</span>
      </div>
      <p className="comment__text">{comment.text}</p>
      {comment.replies && comment.replies.length > 0 && (
        <div className="comment__replies">
          {comment.replies.map(reply => (
            <CommentThread key={reply.id} comment={reply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function PostDetail() {
  const { id } = useParams();
  const post = posts.find(p => p.id === parseInt(id));

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
            <div className="post-detail__author-avatar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            </div>
            <span className="post-detail__author">Posted by: {post.author}</span>
          </div>

          <h1 className="post-detail__title">{post.title}</h1>

          <div className="post-detail__image-wrapper">
            <img src={post.image} alt={post.title} className="post-detail__image" />
          </div>

          {post.pinnedDiscussion && (
            <div className="post-detail__pinned">
              <span className="post-detail__pinned-label">📌 Pinned</span>
              <p className="post-detail__pinned-text">{post.pinnedDiscussion}</p>
            </div>
          )}

          <div className="post-detail__actions">
            <button className="post-detail__action-btn">
              <HeartIcon />
              <span>{post.likes} Likes</span>
            </button>
            <button className="post-detail__action-btn">
              <CommentIcon />
              <span>{post.replyCount} Replies</span>
            </button>
          </div>

          <div className="post-detail__discussion">
            <h3 className="post-detail__discussion-title">Discussion</h3>
            <div className="post-detail__comments">
              {post.comments.map(comment => (
                <CommentThread key={comment.id} comment={comment} depth={0} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <aside className="post-detail__sidebar">
        <div className="post-detail__sidebar-card">
          <h3 className="post-detail__sidebar-title">Recent Activity</h3>
          <div className="post-detail__notifications">
            {followerNotifications.map(notif => (
              <div key={notif.id} className="post-detail__notification">
                <div className="post-detail__notification-avatar">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                  </svg>
                </div>
                <span className="post-detail__notification-text">
                  <strong>{notif.username}</strong> {notif.action}
                </span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

export default PostDetail;
