import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';

// ─── User helpers ─────────────────────────────────────────────

export async function createUserDocument(uid, { email, username, displayName }) {
  await setDoc(doc(db, 'users', uid), {
    uid,
    email,
    username: username.toLowerCase(),
    displayName,
    bio: '',
    followersCount: 0,
    followingCount: 0,
    createdAt: serverTimestamp(),
  });
}

export async function getUserByUid(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

export async function getUserByUsername(username) {
  const q = query(
    collection(db, 'users'),
    where('username', '==', username.toLowerCase())
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data();
}

export async function isUsernameTaken(username) {
  const q = query(
    collection(db, 'users'),
    where('username', '==', username.toLowerCase())
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

export async function updateUserProfile(uid, { displayName, bio }) {
  await updateDoc(doc(db, 'users', uid), { displayName, bio });
}

export async function updateUserAvatar(uid, avatarUrl) {
  await updateDoc(doc(db, 'users', uid), { avatarUrl });

  // Batch-update all posts and comments by this user with the new avatar
  const batch = writeBatch(db);

  const postsSnap = await getDocs(
    query(collection(db, 'posts'), where('authorId', '==', uid))
  );
  postsSnap.docs.forEach((d) => batch.update(d.ref, { authorAvatarUrl: avatarUrl }));

  const commentsSnap = await getDocs(
    query(collection(db, 'comments'), where('authorId', '==', uid))
  );
  commentsSnap.docs.forEach((d) => batch.update(d.ref, { authorAvatarUrl: avatarUrl }));

  await batch.commit();
}

export function searchUsers(prefix, callback) {
  const lower = prefix.toLowerCase();
  const q = query(
    collection(db, 'users'),
    where('username', '>=', lower),
    where('username', '<=', lower + '\uf8ff'),
    limit(10)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => d.data()));
  });
}

// ─── Follow helpers ────────────────────────────────────────────

export async function followUser(followerId, followingId) {
  const docId = `${followerId}_${followingId}`;
  await setDoc(doc(db, 'follows', docId), {
    followerId,
    followingId,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'users', followerId), { followingCount: increment(1) });
  await updateDoc(doc(db, 'users', followingId), { followersCount: increment(1) });
}

export async function unfollowUser(followerId, followingId) {
  const docId = `${followerId}_${followingId}`;
  await deleteDoc(doc(db, 'follows', docId));
  await updateDoc(doc(db, 'users', followerId), { followingCount: increment(-1) });
  await updateDoc(doc(db, 'users', followingId), { followersCount: increment(-1) });
}

export async function isFollowing(followerId, followingId) {
  const docId = `${followerId}_${followingId}`;
  const snap = await getDoc(doc(db, 'follows', docId));
  return snap.exists();
}

export async function getFollowing(uid) {
  const q = query(collection(db, 'follows'), where('followerId', '==', uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data().followingId);
}

export async function getFollowers(uid) {
  const q = query(collection(db, 'follows'), where('followingId', '==', uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data().followerId);
}

export function subscribeToFollowStatus(followerId, followingId, callback) {
  const docId = `${followerId}_${followingId}`;
  return onSnapshot(doc(db, 'follows', docId), (snap) => {
    callback(snap.exists());
  });
}

// ─── Post helpers ──────────────────────────────────────────────

export async function createPost(authorId, authorUsername, authorDisplayName, content, mediaUrl = null, mediaType = null, authorAvatarUrl = null) {
  const ref = await addDoc(collection(db, 'posts'), {
    authorId,
    authorUsername,
    authorDisplayName,
    authorAvatarUrl,
    content,
    mediaUrl,
    mediaType,
    likesCount: 0,
    commentsCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updatePost(postId, content) {
  await updateDoc(doc(db, 'posts', postId), {
    content,
    updatedAt: serverTimestamp(),
  });
}

export async function deletePost(postId) {
  await deleteDoc(doc(db, 'posts', postId));
}

export async function getPost(postId) {
  const snap = await getDoc(doc(db, 'posts', postId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export function subscribeToPost(postId, callback) {
  return onSnapshot(doc(db, 'posts', postId), (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() });
    } else {
      callback(null);
    }
  });
}

// Home feed: posts from followed users + own
export function subscribeToFeed(uid, followingIds, callback) {
  const authorIds = [...followingIds, uid].slice(0, 30);
  if (authorIds.length === 0) {
    callback([]);
    return () => {};
  }
  const q = query(
    collection(db, 'posts'),
    where('authorId', 'in', authorIds),
    limit(50)
  );
  return onSnapshot(q, (snap) => {
    const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    posts.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    callback(posts);
  }, (err) => console.error('subscribeToFeed error:', err));
}

// Only own posts feed (used when following list is empty)
export function subscribeToOwnPosts(uid, callback) {
  const q = query(
    collection(db, 'posts'),
    where('authorId', '==', uid),
    limit(50)
  );
  return onSnapshot(q, (snap) => {
    const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    posts.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    callback(posts);
  }, (err) => console.error('subscribeToOwnPosts error:', err));
}

// Explore: all posts
export function subscribeToExplorePosts(callback) {
  const q = query(
    collection(db, 'posts'),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

// Posts by a specific user
export function subscribeToUserPosts(userId, callback) {
  const q = query(
    collection(db, 'posts'),
    where('authorId', '==', userId),
    limit(50)
  );
  return onSnapshot(q, (snap) => {
    const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    posts.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    callback(posts);
  }, (err) => console.error('subscribeToUserPosts error:', err));
}

// ─── Like helpers ──────────────────────────────────────────────

export async function likePost(userId, postId) {
  const docId = `${userId}_${postId}`;
  await setDoc(doc(db, 'likes', docId), { userId, postId });
  await updateDoc(doc(db, 'posts', postId), { likesCount: increment(1) });
}

export async function unlikePost(userId, postId) {
  const docId = `${userId}_${postId}`;
  await deleteDoc(doc(db, 'likes', docId));
  await updateDoc(doc(db, 'posts', postId), { likesCount: increment(-1) });
}

export async function isLiked(userId, postId) {
  const docId = `${userId}_${postId}`;
  const snap = await getDoc(doc(db, 'likes', docId));
  return snap.exists();
}

export function subscribeToLike(userId, postId, callback) {
  const docId = `${userId}_${postId}`;
  return onSnapshot(doc(db, 'likes', docId), (snap) => {
    callback(snap.exists());
  });
}

// ─── Comment helpers ───────────────────────────────────────────

export async function addComment(postId, authorId, authorUsername, authorDisplayName, content, authorAvatarUrl = null) {
  await addDoc(collection(db, 'comments'), {
    postId,
    authorId,
    authorUsername,
    authorDisplayName,
    authorAvatarUrl,
    content,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'posts', postId), { commentsCount: increment(1) });
}

export async function deleteComment(commentId, postId) {
  await deleteDoc(doc(db, 'comments', commentId));
  await updateDoc(doc(db, 'posts', postId), { commentsCount: increment(-1) });
}

export function subscribeToComments(postId, callback) {
  const q = query(
    collection(db, 'comments'),
    where('postId', '==', postId)
  );
  return onSnapshot(q, (snap) => {
    const comments = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    comments.sort((a, b) => (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0));
    callback(comments);
  }, (err) => console.error('subscribeToComments error:', err));
}

// ─── Notification helpers ──────────────────────────────────────

export async function createNotification({ userId, type, fromUserId, fromUsername, postId = null }) {
  await addDoc(collection(db, 'notifications'), {
    userId,
    type,
    fromUserId,
    fromUsername,
    postId,
    read: false,
    createdAt: serverTimestamp(),
  });
}

export function subscribeToNotifications(userId, callback) {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    limit(30)
  );
  return onSnapshot(q, (snap) => {
    const notifs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    notifs.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    callback(notifs);
  }, (err) => console.error('subscribeToNotifications error:', err));
}

export async function markNotificationRead(notificationId) {
  await updateDoc(doc(db, 'notifications', notificationId), { read: true });
}

export async function markAllNotificationsRead(userId) {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('read', '==', false)
  );
  const snap = await getDocs(q);
  const promises = snap.docs.map((d) => updateDoc(d.ref, { read: true }));
  await Promise.all(promises);
}

// ─── Messaging helpers ─────────────────────────────────────────

export function getConversationId(uid1, uid2) {
  return [uid1, uid2].sort().join('_');
}

export async function getOrCreateConversation(uid1, username1, uid2, username2, avatarUrl1 = null, avatarUrl2 = null) {
  const convId = getConversationId(uid1, uid2);
  const ref = doc(db, 'conversations', convId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      type: 'direct',
      participants: [uid1, uid2],
      participantUsernames: { [uid1]: username1, [uid2]: username2 },
      participantAvatarUrls: { [uid1]: avatarUrl1 || null, [uid2]: avatarUrl2 || null },
      lastMessage: '',
      lastMessageAt: serverTimestamp(),
      unreadCount: { [uid1]: 0, [uid2]: 0 },
    });
  } else {
    // Update avatars in case they changed
    await updateDoc(ref, {
      [`participantAvatarUrls.${uid1}`]: avatarUrl1 || null,
      [`participantAvatarUrls.${uid2}`]: avatarUrl2 || null,
    });
  }
  return convId;
}

export async function sendMessage(conversationId, senderId, senderUsername, content, recipientId, mediaUrl = null, mediaType = null, senderAvatarUrl = null) {
  await addDoc(collection(db, 'messages'), {
    conversationId,
    senderId,
    senderUsername,
    senderAvatarUrl: senderAvatarUrl || null,
    content,
    mediaUrl,
    mediaType,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'conversations', conversationId), {
    lastMessage: content || (mediaUrl ? '[media]' : ''),
    lastMessageAt: serverTimestamp(),
    [`unreadCount.${recipientId}`]: increment(1),
  });
}

export async function markConversationRead(conversationId, userId) {
  await updateDoc(doc(db, 'conversations', conversationId), {
    [`unreadCount.${userId}`]: 0,
  });
}

export function subscribeToConversations(userId, callback) {
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId)
  );
  return onSnapshot(q, (snap) => {
    const convs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    convs.sort((a, b) => {
      const aTime = a.lastMessageAt?.toMillis?.() || 0;
      const bTime = b.lastMessageAt?.toMillis?.() || 0;
      return bTime - aTime;
    });
    callback(convs);
  }, (err) => console.error('subscribeToConversations error:', err));
}

export function subscribeToMessages(conversationId, callback) {
  const q = query(
    collection(db, 'messages'),
    where('conversationId', '==', conversationId)
  );
  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    msgs.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return aTime - bTime;
    });
    callback(msgs);
  }, (err) => console.error('subscribeToMessages error:', err));
}

// Get mutual follows (users who follow back)
export async function getMutualFollows(uid) {
  const followingSnap = await getDocs(
    query(collection(db, 'follows'), where('followerId', '==', uid))
  );
  const followingIds = followingSnap.docs.map((d) => d.data().followingId);
  if (followingIds.length === 0) return [];

  const mutuals = [];
  for (const fid of followingIds) {
    const reverseId = `${fid}_${uid}`;
    const reverseSnap = await getDoc(doc(db, 'follows', reverseId));
    if (reverseSnap.exists()) {
      mutuals.push(fid);
    }
  }
  return mutuals;
}

// ─── Group conversation helpers ────────────────────────────────

export async function createGroupConversation(adminId, adminUsername, adminDisplayName, memberUids, memberUsernames, memberDisplayNames, groupName, groupPhotoUrl = null) {
  const participants = [adminId, ...memberUids];
  const participantUsernames = { [adminId]: adminUsername, ...memberUsernames };
  const participantDisplayNames = { [adminId]: adminDisplayName, ...memberDisplayNames };
  const ref = await addDoc(collection(db, 'conversations'), {
    type: 'group',
    groupName,
    groupPhotoUrl,
    adminId,
    participants,
    participantUsernames,
    participantDisplayNames,
    lastMessage: '',
    lastMessageAt: serverTimestamp(),
    unreadCount: Object.fromEntries(participants.map((uid) => [uid, 0])),
  });
  return ref.id;
}

export async function updateGroupInfo(conversationId, groupName, groupPhotoUrl) {
  await updateDoc(doc(db, 'conversations', conversationId), { groupName, groupPhotoUrl });
}

export async function addGroupMember(conversationId, uid, username, displayName) {
  await updateDoc(doc(db, 'conversations', conversationId), {
    participants: arrayUnion(uid),
    [`participantUsernames.${uid}`]: username,
    [`participantDisplayNames.${uid}`]: displayName,
    [`unreadCount.${uid}`]: 0,
  });
}

export async function leaveGroup(conversationId, uid) {
  await updateDoc(doc(db, 'conversations', conversationId), {
    participants: arrayRemove(uid),
  });
}

export async function sendGroupMessage(conversationId, senderId, senderUsername, content, participantIds, mediaUrl = null, mediaType = null, senderAvatarUrl = null) {
  const batch = writeBatch(db);
  const msgRef = doc(collection(db, 'messages'));
  batch.set(msgRef, {
    conversationId,
    senderId,
    senderUsername,
    senderAvatarUrl: senderAvatarUrl || null,
    content,
    mediaUrl,
    mediaType,
    createdAt: serverTimestamp(),
  });
  const convRef = doc(db, 'conversations', conversationId);
  const unreadUpdates = {};
  participantIds.filter((id) => id !== senderId).forEach((id) => {
    unreadUpdates[`unreadCount.${id}`] = increment(1);
  });
  batch.update(convRef, {
    lastMessage: content || '[media]',
    lastMessageAt: serverTimestamp(),
    ...unreadUpdates,
  });
  await batch.commit();
}
