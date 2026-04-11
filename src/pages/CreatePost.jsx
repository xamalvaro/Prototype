import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createPost } from '../firebase/firestore';
import './CreatePost.css';

function CreatePost() {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim()) {
      setError('Post content cannot be empty.');
      return;
    }
    if (!currentUser || !userProfile) return;

    setError('');
    setLoading(true);
    try {
      await createPost(
        currentUser.uid,
        userProfile.username,
        userProfile.displayName,
        content.trim()
      );
      navigate('/');
    } catch (err) {
      console.error('Create post error:', err);
      setError('Failed to create post. Please try again.');
    }
    setLoading(false);
  }

  const remaining = 500 - content.length;

  return (
    <div className="create-post">
      <div className="create-post__container">
        <h1 className="create-post__heading">Create a Post</h1>

        {error && <div className="create-post__error">{error}</div>}

        <form className="create-post__form" onSubmit={handleSubmit}>
          <div className="create-post__field">
            <label className="create-post__label" htmlFor="post-content">What's on your mind?</label>
            <textarea
              id="post-content"
              className="create-post__textarea"
              placeholder="Share something with your followers..."
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 500))}
              rows={6}
              required
            />
            <span className={`create-post__char-count ${remaining < 50 ? 'create-post__char-count--warn' : ''}`}>
              {remaining} characters remaining
            </span>
          </div>

          <div className="create-post__actions">
            <button
              type="button"
              className="create-post__cancel"
              onClick={() => navigate('/')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="create-post__submit"
              disabled={loading || !content.trim()}
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePost;
