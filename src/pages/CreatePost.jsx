import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createPost } from '../firebase/firestore';
import { uploadMedia } from '../utils/cloudinary';
import './CreatePost.css';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

function CreatePost() {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState(null);
  const [mediaType, setMediaType] = useState(null); // 'image' | 'video'
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  function handleFileSelect(file) {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Unsupported file type. Use JPEG, PNG, GIF, WebP, MP4, or WebM.');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError('File too large. Maximum size is 50MB.');
      return;
    }
    setError('');
    setMediaFile(file);
    const type = file.type.startsWith('video/') ? 'video' : 'image';
    setMediaType(type);
    const url = URL.createObjectURL(file);
    setMediaPreviewUrl(url);
  }

  function handleInputChange(e) {
    const file = e.target.files?.[0];
    handleFileSelect(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function removeMedia() {
    setMediaFile(null);
    setMediaType(null);
    if (mediaPreviewUrl) {
      URL.revokeObjectURL(mediaPreviewUrl);
      setMediaPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim()) {
      setError('Post content cannot be empty.');
      return;
    }
    if (!currentUser || !userProfile) return;

    setError('');
    setLoading(true);

    let uploadedUrl = null;
    let uploadedType = null;

    try {
      if (mediaFile) {
        setUploading(true);
        const result = await uploadMedia(mediaFile);
        uploadedUrl = result.url;
        uploadedType = result.mediaType;
        setUploading(false);
      }

      await createPost(
        currentUser.uid,
        userProfile.username,
        userProfile.displayName,
        content.trim(),
        uploadedUrl,
        uploadedType
      );
      navigate('/');
    } catch (err) {
      console.error('Create post error:', err);
      setUploading(false);
      setError(err.message === 'Upload failed' ? 'Media upload failed. Please try again.' : 'Failed to create post. Please try again.');
    }
    setLoading(false);
  }

  const remaining = 500 - content.length;

  return (
    <div className="create-post">
      <div className="create-post__container">
        <h1 className="create-post__heading">[ NEW TRANSMISSION ]</h1>

        {error && <div className="create-post__error">{error}</div>}

        <form className="create-post__form" onSubmit={handleSubmit}>
          <div className="create-post__field">
            <label className="create-post__label" htmlFor="post-content">What&apos;s on your mind?</label>
            <textarea
              id="post-content"
              className="create-post__textarea"
              placeholder="Share something with your followers..."
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 500))}
              rows={6}
            />
            <span className={`create-post__char-count ${remaining < 50 ? 'create-post__char-count--warn' : ''}`}>
              {remaining} characters remaining
            </span>
          </div>

          {/* Media upload zone */}
          <div className="create-post__media-field">
            <label className="create-post__label">Attach Media (optional)</label>

            {uploading ? (
              <div className="create-post__upload-loading">
                <span className="create-post__upload-loading-text">UPLOADING...</span>
              </div>
            ) : mediaPreviewUrl ? (
              <div className="create-post__preview-wrapper">
                {mediaType === 'image' ? (
                  <img src={mediaPreviewUrl} alt="preview" className="create-post__preview-img" />
                ) : (
                  <video src={mediaPreviewUrl} className="create-post__preview-video" autoPlay muted loop />
                )}
                <button
                  type="button"
                  className="create-post__preview-remove"
                  onClick={removeMedia}
                  title="Remove media"
                >
                  ×
                </button>
              </div>
            ) : (
              <div
                className={`create-post__drop-zone ${dragOver ? 'create-post__drop-zone--active' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="create-post__drop-label">[ DROP IMAGE OR VIDEO HERE ]</span>
                <span className="create-post__drop-hint">or click to select &bull; max 50MB</span>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(',')}
              onChange={handleInputChange}
              style={{ display: 'none' }}
            />
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
              disabled={loading || uploading || !content.trim()}
            >
              {uploading ? 'Uploading...' : loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePost;
