'use client';

import { useState } from 'react';
import { Loader2, MessageCircle } from 'lucide-react';
import { useComments } from '@/hooks/useSocial';
import CommentCard from './CommentCard';
import AddCommentForm from './AddCommentForm';

interface CommentsListProps {
  postId: string;
  currentUserId?: string;
}

export default function CommentsList({ postId, currentUserId }: CommentsListProps) {
  const { comments, loading, addComment, deleteComment } = useComments(postId);
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null);

  const handleAddComment = async (content: string) => {
    return await addComment(content, replyingTo?.id);
  };

  const handleReply = (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      const username = comment.user.firstName && comment.user.lastName
        ? `${comment.user.firstName} ${comment.user.lastName}`
        : comment.user.username;
      setReplyingTo({ id: commentId, username });
    }
  };

  const handleDelete = async (commentId: string) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      await deleteComment(commentId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Comments header */}
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <MessageCircle className="h-4 w-4" />
        <span>{comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}</span>
      </div>

      {/* Add comment form */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <AddCommentForm
          onSubmit={handleAddComment}
          onCancel={replyingTo ? () => setReplyingTo(null) : undefined}
          replyingTo={replyingTo?.username}
          placeholder={replyingTo ? `Reply to ${replyingTo.username}...` : 'Write a comment...'}
          autoFocus={!!replyingTo}
        />
      </div>

      {/* Comments list */}
      {loading && comments.length === 0 ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
          <p className="text-sm">No comments yet</p>
          <p className="text-xs mt-1">Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onDelete={handleDelete}
              onReply={handleReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}
