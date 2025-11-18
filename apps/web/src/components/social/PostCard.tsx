'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Trash2,
  Flag,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import CommentsList from './CommentsList';

interface PostCardProps {
  post: {
    id: string;
    content: string;
    images?: string[];
    createdAt: string;
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    isLiked?: boolean;
    user: {
      id: string;
      username: string;
      firstName?: string;
      lastName?: string;
      avatar?: string;
    };
  };
  currentUserId?: string;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onReport?: (postId: string) => void;
}

export default function PostCard({
  post,
  currentUserId,
  onLike,
  onComment,
  onShare,
  onDelete,
  onReport,
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [showComments, setShowComments] = useState(false);

  const isOwnPost = currentUserId === post.user.id;
  const displayName = post.user.firstName && post.user.lastName
    ? `${post.user.firstName} ${post.user.lastName}`
    : post.user.username;

  const handleLike = async () => {
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);
    onLike?.(post.id);
  };

  const handleComment = () => {
    setShowComments(!showComments);
    onComment?.(post.id);
  };

  const handleShare = () => {
    onShare?.(post.id);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this post?')) {
      onDelete?.(post.id);
    }
  };

  const handleReport = () => {
    onReport?.(post.id);
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {post.user.avatar ? (
                <img src={post.user.avatar} alt={displayName} className="object-cover" />
              ) : (
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-full h-full flex items-center justify-center text-white font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{displayName}</p>
              <p className="text-xs text-slate-500">
                @{post.user.username} · {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwnPost ? (
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Post
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={handleReport}>
                  <Flag className="h-4 w-4 mr-2" />
                  Report Post
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-slate-900 whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className={`mb-4 grid gap-2 ${
            post.images.length === 1 ? 'grid-cols-1' :
            post.images.length === 2 ? 'grid-cols-2' :
            'grid-cols-2'
          }`}>
            {post.images.map((image, index) => (
              <div key={index} className="relative aspect-video bg-slate-100 rounded-lg overflow-hidden">
                <img
                  src={image}
                  alt={`Post image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 py-2 border-t border-b border-slate-100 text-sm text-slate-600">
          <span>{likesCount} likes</span>
          <span>{post.commentsCount} comments</span>
          <span>{post.sharesCount} shares</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-around pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`flex-1 ${isLiked ? 'text-red-500' : 'text-slate-600'}`}
          >
            <Heart className={`h-5 w-5 mr-2 ${isLiked ? 'fill-current' : ''}`} />
            Like
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleComment}
            className={`flex-1 ${showComments ? 'text-blue-600' : 'text-slate-600'}`}
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Comment
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex-1 text-slate-600"
          >
            <Share2 className="h-5 w-5 mr-2" />
            Share
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <CommentsList postId={post.id} currentUserId={currentUserId} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
