'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Image, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onPostCreated?: () => void;
}

export default function CreatePostModal({
  open,
  onOpenChange,
  userId,
  onPostCreated,
}: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Please write something');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          images: images.filter(img => img.trim()),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setContent('');
        setImages([]);
        onPostCreated?.();
        onOpenChange(false);
      } else {
        setError(data.error || 'Failed to create post');
      }
    } catch (err) {
      setError('An error occurred while creating the post');
      console.error('Error creating post:', err);
    } finally {
      setLoading(false);
    }
  };

  const addImage = () => {
    if (images.length < 4) {
      setImages([...images, '']);
    }
  };

  const updateImage = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Content */}
          <div>
            <Textarea
              placeholder="What's on your mind? Share your fitness journey..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="resize-none"
              maxLength={2000}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-slate-500">
                {content.length}/2000 characters
              </span>
            </div>
          </div>

          {/* Images */}
          {images.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Images (URLs)</p>
              {images.map((image, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={image}
                    onChange={(e) => updateImage(index, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add Image Button */}
          {images.length < 4 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addImage}
              className="w-full"
            >
              <Image className="h-4 w-4 mr-2" />
              Add Image URL ({images.length}/4)
            </Button>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !content.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                'Post'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
