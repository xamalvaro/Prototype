import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  getUserByUsername,
  subscribeToUserPosts,
  followUser,
  unfollowUser,
  subscribeToFollowStatus,
  createNotification,
  updateUserAvatar,
} from '../firebase/firestore';
import { uploadMedia } from '../utils/cloudinary';
import PostCard from '../components/PostCard';
import AvatarInitials from '../components/AvatarInitials';
import './Profile.css';

function Profile() {
  const { username } = useParams();
  const { currentUser, userProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const avatarInputRef = useRef(null);

  const isOwnProfile = currentUser && profile && currentUser.uid === profile.uid;

  useEffect(() => {
    let unsubPosts = null;
    let unsubFollow = null;

    async function load() {
      setLoading(true);
      const user = await getUserByUsername(username);
      setProfile(user);
      setLoading(false);

      if (user) {
        unsubPosts = subscribeToUserPosts(user.uid, setPosts);
        if (currentUser && currentUser.uid !== user.uid) {
          unsubFollow = subscribeToFollowStatus(currentUser.uid, user.uid, setIsFollowing);
        }
      }
    }

    load();

    return () => {
      if (unsubPosts) unsubPosts();
      if (unsubFollow) unsubFollow();
    };
  }, [username, currentUser]);

  // Sync own profile avatar from userProfile context (keeps it live)
  useEffect(() => {
    if (isOwnProfile && userProfile?.avatarUrl && profile) {
      setProfile((prev) => prev ? { ...prev, avatarUrl: userProfile.avatarUrl } : prev);
    }
  }, [userProfile?.avatarUrl]);

  async function handleFollow() {
    if (!currentUser || !profile || followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(currentUser.uid, profile.uid);
      } else {
        await followUser(currentUser.uid, profile.uid);
        await createNotification({
          userId: profile.uid,
          type: 'follow',
          fromUserId: currentUser.uid,
          fromUsername: userProfile?.username || '',
        });
      }
    } catch (err) {
      console.error('Follow error:', err);
    }
    setFollowLoading(false);
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select an image file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setAvatarError('Image too large. Max 10MB.');
      return;
    }
    setAvatarError('');
    setAvatarUploading(true);
    try {
      const { url } = await uploadMedia(file);
      await updateUserAvatar(currentUser.uid, url);
      setProfile((prev) => prev ? { ...prev, avatarUrl: url } : prev);
    } catch (err) {
      console.error('Avatar upload error:', err);
      setAvatarError('Avatar upload failed. Please try again.');
    }
    setAvatarUploading(false);
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  }

  if (loading) {
    return (
      <div className="profile">
        <div className="profile__loading">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile">
        <div className="profile__not-found">
          <p>User not found.</p>
          <Link to="/">Go home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="profile">
      <div className="profile__header-card">
        <div className="profile__avatar-row">
          <div className="profile__avatar-ring">
            {isOwnProfile ? (
              <div className="profile__avatar-upload-wrapper">
                <AvatarInitials
                  username={profile.username}
                  displayName={profile.displayName}
                  avatarUrl={profile.avatarUrl}
                  size={72}
                />
                {avatarUploading ? (
                  <div className="profile__avatar-overlay profile__avatar-overlay--loading">
                    <span className="profile__avatar-uploading">...</span>
                  </div>
                ) : (
                  <div
                    className="profile__avatar-overlay"
                    onClick={() => avatarInputRef.current?.click()}
                    title="Change avatar"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                  </div>
                )}
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
              </div>
            ) : (
              <AvatarInitials
                username={profile.username}
                displayName={profile.displayName}
                avatarUrl={profile.avatarUrl}
                size={72}
              />
            )}
          </div>
          <div className="profile__identity">
            <h1 className="profile__display-name">{profile.displayName}</h1>
            <span className="profile__username">@{profile.username}</span>
            {avatarError && <span className="profile__avatar-error">{avatarError}</span>}
          </div>
          {!isOwnProfile && currentUser && (
            <button
              className={`profile__follow-btn ${isFollowing ? 'profile__follow-btn--following' : ''}`}
              onClick={handleFollow}
              disabled={followLoading}
            >
              {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>

        {profile.bio && (
          <p className="profile__bio">{profile.bio}</p>
        )}

        <div className="profile__stats">
          <div className="profile__stat">
            <span className="profile__stat-count">{profile.followersCount || 0}</span>
            <span className="profile__stat-label">Followers</span>
          </div>
          <div className="profile__stat">
            <span className="profile__stat-count">{profile.followingCount || 0}</span>
            <span className="profile__stat-label">Following</span>
          </div>
          <div className="profile__stat">
            <span className="profile__stat-count">{posts.length}</span>
            <span className="profile__stat-label">Posts</span>
          </div>
        </div>

        <div className="profile__badges">
          <span className="profile__badge profile__badge--member">◈ MEMBER</span>
          {posts.length > 0 && <span className="profile__badge profile__badge--active">★ ACTIVE</span>}
          {(profile.followersCount || 0) > 0 && <span className="profile__badge profile__badge--verified">✦ CONNECTED</span>}
        </div>
      </div>

      <div className="profile__posts">
        <h2 className="profile__posts-title">Posts</h2>
        {posts.length === 0 ? (
          <div className="profile__empty">No posts yet.</div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>
    </div>
  );
}

export default Profile;
