'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, X, Loader2 } from 'lucide-react';

interface AddCommentFormProps {
  onSubmit: (content: string) => Promise<any>;
  onCancel?: () => void;
  placeholder?: string;
  replyingTo?: string;
  autoFocus?: boolean;
}

export default function AddCommentForm({
  onSubmit,
  onCancel,
  placeholder = 'Write a comment...',
  replyingTo,
  autoFocus = false,
}: AddCommentFormProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await onSubmit(content.trim());

      if (result.success) {
        setContent('');
        onCancel?.();
      } else {
        setError(result.error || 'Failed to post comment');
      }
    } catch (err) {
      setError('An error occurred');
      console.error('Error posting comment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e as any);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {replyingTo && (
        <div className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2 border border-blue-200">
          <p className="text-sm text-blue-700">
            Replying to <span className="font-semibold">{replyingTo}</span>
          </p>
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={onCancel}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      <Textarea
        placeholder={placeholder}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={3}
        className="resize-none"
        maxLength={500}
        disabled={loading}
        autoFocus={autoFocus}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">
            {content.length}/500 characters
          </span>
          {onCancel && (
            <span className="text-xs text-slate-400">
              • Ctrl+Enter to submit
            </span>
          )}
        </div>

        <div className="flex gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={!content.trim() || loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Comment
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </form>
  );
}
