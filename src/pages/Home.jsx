import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getFollowing, subscribeToFeed, subscribeToOwnPosts } from '../firebase/firestore';
import PostCard from '../components/PostCard';
import './Home.css';

function Home() {
  const { currentUser, userProfile } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    let unsub = null;

    async function setupFeed() {
      const followingIds = await getFollowing(currentUser.uid);

      if (followingIds.length === 0) {
        // Only own posts
        unsub = subscribeToOwnPosts(currentUser.uid, (data) => {
          setPosts(data);
          setLoading(false);
        });
      } else {
        unsub = subscribeToFeed(currentUser.uid, followingIds, (data) => {
          setPosts(data);
          setLoading(false);
        });
      }
    }

    setupFeed();

    return () => {
      if (unsub) unsub();
    };
  }, [currentUser]);

  return (
    <div className="home">
      <div className="home__feed">
        {loading && (
          <div className="home__loading">Loading feed...</div>
        )}
        {!loading && posts.length === 0 && (
          <div className="home__empty">
            <h3 className="home__empty-title">Your feed is empty</h3>
            <p className="home__empty-text">
              Follow other users to see their posts, or{' '}
              <Link to="/explore" className="home__empty-link">explore</Link> to discover people.
            </p>
            <Link to="/create" className="home__empty-create">Create your first post</Link>
          </div>
        )}
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      <aside className="home__sidebar">
        <div className="home__sidebar-card">
          <h3 className="home__sidebar-title">Quick Links</h3>
          <div className="home__quick-links">
            <Link to="/create" className="home__quick-link">
              + Create Post
            </Link>
            <Link to="/explore" className="home__quick-link">
              Explore Users
            </Link>
            {userProfile && (
              <Link to={`/profile/${userProfile.username}`} className="home__quick-link">
                My Profile
              </Link>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}

export default Home;
