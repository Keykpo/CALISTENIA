'use client';

import { useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Trash2, Reply } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommentCardProps {
  comment: {
    id: string;
    content: string;
    createdAt: string;
    user: {
      id: string;
      username: string;
      firstName?: string;
      lastName?: string;
      avatar?: string;
    };
    replies?: any[];
  };
  currentUserId?: string;
  onDelete?: (commentId: string) => void;
  onReply?: (commentId: string) => void;
  isReply?: boolean;
}

export default function CommentCard({
  comment,
  currentUserId,
  onDelete,
  onReply,
  isReply = false,
}: CommentCardProps) {
  const isOwnComment = currentUserId === comment.user.id;
  const displayName = comment.user.firstName && comment.user.lastName
    ? `${comment.user.firstName} ${comment.user.lastName}`
    : comment.user.username;

  return (
    <div className={`flex gap-3 ${isReply ? 'ml-12 mt-3' : ''}`}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        {comment.user.avatar ? (
          <img src={comment.user.avatar} alt={displayName} className="object-cover" />
        ) : (
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-full h-full flex items-center justify-center text-white font-bold text-xs">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="bg-slate-100 rounded-lg px-3 py-2">
          <div className="flex items-center justify-between mb-1">
            <p className="font-semibold text-sm text-slate-900">{displayName}</p>
            {isOwnComment && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-slate-500 hover:text-red-600"
                onClick={() => onDelete?.(comment.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
          <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">
            {comment.content}
          </p>
        </div>

        <div className="flex items-center gap-3 mt-1 px-2">
          <span className="text-xs text-slate-500">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
          {!isReply && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-slate-600 hover:text-blue-600"
              onClick={() => onReply?.(comment.id)}
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
          )}
        </div>

        {/* Render replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map((reply) => (
              <CommentCard
                key={reply.id}
                comment={reply}
                currentUserId={currentUserId}
                onDelete={onDelete}
                isReply={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
