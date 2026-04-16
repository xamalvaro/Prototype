import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  getUserByUsername,
  subscribeToUserPosts,
  followUser,
  unfollowUser,
  subscribeToFollowStatus,
  createNotification,
} from '../firebase/firestore';
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
            <AvatarInitials username={profile.username} displayName={profile.displayName} size={72} />
          </div>
          <div className="profile__identity">
            <h1 className="profile__display-name">{profile.displayName}</h1>
            <span className="profile__username">@{profile.username}</span>
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
