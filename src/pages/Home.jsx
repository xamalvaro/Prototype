import { Link } from 'react-router-dom';
import { posts, followerNotifications } from '../data/mockData';
import './Home.css';

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

function PostCard({ post }) {
  const previewComments = post.comments.slice(0, 2);

  return (
    <div className="post-card">
      <div className="post-card__header">
        <div className="post-card__author-avatar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
          </svg>
        </div>
        <span className="post-card__author">Posted by: {post.author}</span>
      </div>

      <Link to={`/post/${post.id}`} className="post-card__title-link">
        <h2 className="post-card__title">{post.title}</h2>
      </Link>

      <div className="post-card__image-wrapper">
        <img src={post.image} alt={post.title} className="post-card__image" />
      </div>

      <div className="post-card__discussion">
        {previewComments.map(comment => (
          <div key={comment.id} className="post-card__comment">
            <span className="post-card__comment-author">{comment.author}:</span>
            <span className="post-card__comment-text"> {comment.text}</span>
          </div>
        ))}
      </div>

      <div className="post-card__footer">
        <div className="post-card__actions">
          <button className="post-card__action-btn">
            <HeartIcon />
            <span>{post.likes}</span>
          </button>
          <Link to={`/post/${post.id}`} className="post-card__action-btn">
            <CommentIcon />
            <span>{post.replyCount} Replies</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Home() {
  return (
    <div className="home">
      <div className="home__feed">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      <aside className="home__sidebar">
        <div className="home__sidebar-card">
          <h3 className="home__sidebar-title">Recent Activity</h3>
          <div className="home__notifications">
            {followerNotifications.map(notif => (
              <div key={notif.id} className="home__notification">
                <div className="home__notification-avatar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                  </svg>
                </div>
                <span className="home__notification-text">
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

export default Home;
