import { useState, useCallback, useEffect } from 'react';

// Hook for managing posts
export function usePosts(filter: 'all' | 'friends' | 'own' = 'all') {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const fetchPosts = useCallback(async (reset = false) => {
    setLoading(true);
    setError(null);
    try {
      const currentOffset = reset ? 0 : offset;
      const res = await fetch(
        `/api/social/posts?filter=${filter}&limit=10&offset=${currentOffset}`
      );
      const data = await res.json();

      if (data.success) {
        if (reset) {
          setPosts(data.posts);
          setOffset(10);
        } else {
          setPosts(prev => [...prev, ...data.posts]);
          setOffset(prev => prev + 10);
        }
        setHasMore(data.hasMore);
      } else {
        setError(data.error || 'Failed to fetch posts');
      }
    } catch (err) {
      setError('An error occurred while fetching posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  }, [filter, offset]);

  const createPost = useCallback(async (content: string, images?: string[]) => {
    try {
      const res = await fetch('/api/social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, images }),
      });
      const data = await res.json();

      if (data.success) {
        fetchPosts(true);
        return { success: true, post: data.post };
      }
      return { success: false, error: data.error };
    } catch (err) {
      console.error('Error creating post:', err);
      return { success: false, error: 'Failed to create post' };
    }
  }, [fetchPosts]);

  const likePost = useCallback(async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const method = post.isLiked ? 'DELETE' : 'POST';

    // Optimistic update
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, isLiked: !p.isLiked, likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1 }
        : p
    ));

    try {
      await fetch(`/api/social/posts/${postId}/like`, { method });
    } catch (err) {
      // Revert on error
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, isLiked: post.isLiked, likesCount: post.likesCount }
          : p
      ));
    }
  }, [posts]);

  const deletePost = useCallback(async (postId: string) => {
    try {
      const res = await fetch(`/api/social/posts/${postId}`, { method: 'DELETE' });
      if (res.ok) {
        setPosts(prev => prev.filter(p => p.id !== postId));
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      console.error('Error deleting post:', err);
      return { success: false };
    }
  }, []);

  useEffect(() => {
    fetchPosts(true);
  }, [filter]);

  return {
    posts,
    loading,
    error,
    hasMore,
    fetchPosts,
    createPost,
    likePost,
    deletePost,
  };
}

// Hook for managing friends
export function useFriends(status: 'ACCEPTED' | 'PENDING_RECEIVED' | 'PENDING_SENT' = 'ACCEPTED') {
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFriends = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/social/friends?status=${status}`);
      const data = await res.json();

      if (data.success) {
        setFriends(data.friends);
      } else {
        setError(data.error || 'Failed to fetch friends');
      }
    } catch (err) {
      setError('An error occurred while fetching friends');
      console.error('Error fetching friends:', err);
    } finally {
      setLoading(false);
    }
  }, [status]);

  const sendFriendRequest = useCallback(async (friendUsername: string) => {
    try {
      const res = await fetch('/api/social/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendUsername }),
      });
      const data = await res.json();

      if (data.success) {
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err) {
      console.error('Error sending friend request:', err);
      return { success: false, error: 'Failed to send friend request' };
    }
  }, []);

  const acceptRequest = useCallback(async (friendshipId: string) => {
    try {
      const res = await fetch(`/api/social/friends/${friendshipId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      });

      if (res.ok) {
        fetchFriends();
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      console.error('Error accepting request:', err);
      return { success: false };
    }
  }, [fetchFriends]);

  const rejectRequest = useCallback(async (friendshipId: string) => {
    try {
      const res = await fetch(`/api/social/friends/${friendshipId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' }),
      });

      if (res.ok) {
        fetchFriends();
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      console.error('Error rejecting request:', err);
      return { success: false };
    }
  }, [fetchFriends]);

  const removeFriend = useCallback(async (friendshipId: string) => {
    try {
      const res = await fetch(`/api/social/friends/${friendshipId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchFriends();
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      console.error('Error removing friend:', err);
      return { success: false };
    }
  }, [fetchFriends]);

  useEffect(() => {
    fetchFriends();
  }, [status]);

  return {
    friends,
    loading,
    error,
    fetchFriends,
    sendFriendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
  };
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/social/notifications?limit=20');
      const data = await res.json();

      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId?: string) => {
    try {
      const res = await fetch('/api/social/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId: notificationId || undefined,
          markAllRead: !notificationId,
        }),
      });

      if (res.ok) {
        if (notificationId) {
          setNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
          );
          setUnreadCount(prev => Math.max(0, prev - 1));
        } else {
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
          setUnreadCount(0);
        }
      }
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const res = await fetch('/api/social/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });

      if (res.ok) {
        const wasUnread = notifications.find(n => n.id === notificationId && !n.read);
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        if (wasUnread) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  }, [notifications]);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    deleteNotification,
  };
}

// Hook for managing direct messages
export function useMessages() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/social/messages');
      const data = await res.json();

      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (recipientId: string, content: string) => {
    try {
      const res = await fetch('/api/social/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId, content }),
      });
      const data = await res.json();

      if (data.success) {
        fetchConversations();
        return { success: true, message: data.message };
      }
      return { success: false, error: data.error };
    } catch (err) {
      console.error('Error sending message:', err);
      return { success: false, error: 'Failed to send message' };
    }
  }, [fetchConversations]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    loading,
    fetchConversations,
    sendMessage,
  };
}

// Hook for communities
export function useCommunities(filter: 'all' | 'joined' | 'own' = 'all') {
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCommunities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/social/communities?filter=${filter}`);
      const data = await res.json();

      if (data.success) {
        setCommunities(data.communities);
      }
    } catch (err) {
      console.error('Error fetching communities:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const joinCommunity = useCallback(async (communityId: string) => {
    try {
      const res = await fetch(`/api/social/communities/${communityId}/join`, {
        method: 'POST',
      });

      if (res.ok) {
        fetchCommunities();
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      console.error('Error joining community:', err);
      return { success: false };
    }
  }, [fetchCommunities]);

  const leaveCommunity = useCallback(async (communityId: string) => {
    try {
      const res = await fetch(`/api/social/communities/${communityId}/join`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchCommunities();
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      console.error('Error leaving community:', err);
      return { success: false };
    }
  }, [fetchCommunities]);

  useEffect(() => {
    fetchCommunities();
  }, [filter]);

  return {
    communities,
    loading,
    fetchCommunities,
    joinCommunity,
    leaveCommunity,
  };
}

// Hook for leaderboard
export function useLeaderboard(type: 'global' | 'friends' = 'global') {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/social/leaderboard?type=${type}`);
      const data = await res.json();

      if (data.success) {
        setLeaderboard(data.leaderboard);
        setCurrentUserRank(data.currentUserRank);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchLeaderboard();
  }, [type]);

  return {
    leaderboard,
    currentUserRank,
    loading,
    fetchLeaderboard,
  };
}
