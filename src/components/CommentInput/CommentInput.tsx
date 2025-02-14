import React, { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postCommentOnPost } from '@/lib/api/posts';
import { Button } from '@/components/ui/button';
import { MentionsInput } from '@/components/ui/mentions-input';
import { LimitsDisplay } from '@/components/LimitsDisplay/LimitsDisplay';
import { useLimits } from '@/context/LimitsContext';
import { cn } from '@/lib/utils/cn';
import { MediaPreview } from '@/components/MediaPreview/MediaPreview';
import { useUrlDetection } from '@/hooks/useUrlDetection';

interface CommentInputProps {
  postId: string;
  className?: string;
}

const MAX_CHARS = 280;

export const CommentInput: React.FC<CommentInputProps> = ({
  postId,
  className
}) => {
  const [text, setText] = useState('');
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const { limits, refreshLimits } = useLimits();
  const { urls } = useUrlDetection(text);

  const { mutateAsync: createCommentMutation, isPending } = useMutation({
    mutationFn: () => postCommentOnPost(postId, { text, mentionedUserIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      refreshLimits();
    }
  });

  const handleTextChange = (newText: string) => {
    if (newText.length <= MAX_CHARS) {
      setText(newText);
    }
  };

  const handleMentionsChange = (users: string[]) => {
    setMentionedUserIds(users);
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;

    try {
      await createCommentMutation();
      setText('');
      setMentionedUserIds([]);
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  const handleRemoveUrl = useCallback((urlToRemove: string) => {
    setText((currentText) => {
      // Create a regex that matches the URL with optional surrounding whitespace
      const urlRegex = new RegExp(
        `\\s*${urlToRemove.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`
      );
      return currentText.replace(urlRegex, ' ').trim();
    });
  }, []);

  const charsLeft = MAX_CHARS - text.length;
  const isNearLimit = charsLeft <= 20;
  const isAtLimit = limits?.comments.remaining === 0;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="space-y-4">
        <MentionsInput
          value={text}
          onChange={handleTextChange}
          onMentionsChange={handleMentionsChange}
          placeholder="Write a comment..."
          maxLength={MAX_CHARS}
          rows={2}
          disabled={isAtLimit}
          className="min-h-[80px]"
        />
        {urls.length > 0 && (
          <div className="space-y-2">
            {urls
              .filter(
                (metadata) =>
                  metadata.type !== 'URL' ||
                  metadata.description ||
                  (metadata.image && metadata.title)
              )
              .map((metadata, index) => (
                <MediaPreview
                  key={`${metadata.url}-${index}`}
                  metadata={metadata}
                  onRemove={() => handleRemoveUrl(metadata.url)}
                />
              ))}
          </div>
        )}
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span
            className={cn(
              'text-sm transition-colors',
              isNearLimit ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
            {charsLeft} characters left
          </span>
          <Button
            onClick={handleSubmit}
            disabled={
              isPending || !text.trim() || text.length > MAX_CHARS || isAtLimit
            }
          >
            {isPending ? 'Posting...' : 'Comment'}
          </Button>
        </div>
        <LimitsDisplay type="comments" showUpgradeButton={isAtLimit} />
      </div>
    </div>
  );
};
