'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RefreshCw, Loader2, PlusCircle } from 'lucide-react';
import PostCard from './PostCard';
import CreatePostModal from './CreatePostModal';

interface SocialFeedProps {
  userId: string;
}

export default function SocialFeed({ userId }: SocialFeedProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'friends' | 'own'>('all');
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [showCreatePost, setShowCreatePost] = useState(false);

  const fetchPosts = useCallback(async (reset = false) => {
    setLoading(true);
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
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, offset]);

  useEffect(() => {
    fetchPosts(true);
  }, [filter]);

  const handleLike = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      const method = post.isLiked ? 'DELETE' : 'POST';
      const res = await fetch(`/api/social/posts/${postId}/like`, { method });

      if (res.ok) {
        setPosts(prev => prev.map(p =>
          p.id === postId
            ? { ...p, isLiked: !p.isLiked, likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1 }
            : p
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      const res = await fetch(`/api/social/posts/${postId}`, { method: 'DELETE' });

      if (res.ok) {
        setPosts(prev => prev.filter(p => p.id !== postId));
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handlePostCreated = () => {
    setShowCreatePost(false);
    fetchPosts(true);
  };

  return (
    <>
      <CreatePostModal
        open={showCreatePost}
        onOpenChange={setShowCreatePost}
        userId={userId}
        onPostCreated={handlePostCreated}
      />

      <Card className="shadow-lg border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Social Feed</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchPosts(true)}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                size="sm"
                onClick={() => setShowCreatePost(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter Tabs */}
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="mb-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Posts</TabsTrigger>
              <TabsTrigger value="friends">Friends</TabsTrigger>
              <TabsTrigger value="own">My Posts</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Posts List */}
          <div className="space-y-4">
            {posts.length === 0 && !loading ? (
              <div className="text-center py-12 text-slate-500">
                <p className="font-medium">No posts yet</p>
                <p className="text-sm mt-1">Be the first to share something!</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setShowCreatePost(true)}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Post
                </Button>
              </div>
            ) : (
              posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={userId}
                  onLike={handleLike}
                  onDelete={handleDelete}
                />
              ))
            )}

            {loading && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            )}

            {hasMore && posts.length > 0 && !loading && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => fetchPosts(false)}
                >
                  Load More
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
