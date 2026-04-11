import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreatePost.css';

function UploadIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  );
}

function CreatePost() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [discussion, setDiscussion] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Simulate post submission
    navigate('/');
  }

  return (
    <div className="create-post">
      <div className="create-post__container">
        <h1 className="create-post__heading">Create a Post</h1>

        <form className="create-post__form" onSubmit={handleSubmit}>
          <div className="create-post__field">
            <label className="create-post__label" htmlFor="post-title">Title</label>
            <input
              id="post-title"
              type="text"
              className="create-post__input"
              placeholder="Give your post a title..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="create-post__field">
            <label className="create-post__label">Image or Video</label>
            <label
              className={`create-post__upload-area ${dragOver ? 'create-post__upload-area--drag' : ''}`}
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              htmlFor="post-media"
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="create-post__preview" />
              ) : (
                <>
                  <div className="create-post__upload-icon">
                    <UploadIcon />
                  </div>
                  <p className="create-post__upload-text">Insert Image or video here</p>
                  <p className="create-post__upload-hint">Click to browse or drag and drop</p>
                </>
              )}
              <input
                id="post-media"
                type="file"
                accept="image/*,video/*"
                className="create-post__file-input"
                onChange={handleFileChange}
              />
            </label>
          </div>

          <div className="create-post__field">
            <label className="create-post__label" htmlFor="post-discussion">Pinned Discussion Point</label>
            <textarea
              id="post-discussion"
              className="create-post__textarea"
              placeholder="Add a pinned discussion point here..."
              value={discussion}
              onChange={e => setDiscussion(e.target.value)}
              rows={4}
            />
          </div>

          <button type="submit" className="create-post__submit">
            Submit Post
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreatePost;
