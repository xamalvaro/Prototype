import { useState, useEffect } from 'react';
import { subscribeToExplorePosts } from '../firebase/firestore';
import PostCard from '../components/PostCard';
import './Explore.css';

function Explore() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToExplorePosts((data) => {
      setPosts(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <div className="explore">
      <div className="explore__header">
        <h1 className="explore__title">Explore</h1>
        <p className="explore__sub">Discover posts from everyone on NewSpace</p>
      </div>

      <div className="explore__feed">
        {loading && (
          <div className="explore__loading">Loading posts...</div>
        )}
        {!loading && posts.length === 0 && (
          <div className="explore__empty">
            <p>No posts yet. Be the first to post!</p>
          </div>
        )}
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

export default Explore;
