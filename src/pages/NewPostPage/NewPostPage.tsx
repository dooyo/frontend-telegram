import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createPost } from '@/lib/api/posts';
import { getMe } from '@/lib/api/profiles';
import { UserType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@files-ui/react';
import { cn } from '@/lib/utils/cn';

const MAX_CHARS = 280;

export const NewPostPage: React.FC = () => {
  const [text, setText] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });

  const { data: me, isLoading } = useQuery<UserType>({
    queryKey: ['me'],
    queryFn: getMe
  });

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    if (newText.length <= MAX_CHARS) {
      setText(newText);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const remainingChars = MAX_CHARS - text.length;
    const trimmedText = pastedText.slice(0, remainingChars);
    setText((prev) => prev + trimmedText);
  };

  const handlePost = async () => {
    if (!text.trim()) return;

    try {
      await mutateAsync({ text } as any);
      setText('');
      navigate(-1); // Go back to the previous page
    } catch (error) {
      console.error('Failed to post:', error);
    }
  };

  if (isLoading) {
    return (
      <Container>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Container>
    );
  }

  const charsLeft = MAX_CHARS - text.length;
  const isNearLimit = charsLeft <= 20;
  const isAtLimit = charsLeft === 0;

  return (
    <Container className="py-4">
      <div className="space-y-4">
        <div className="flex gap-4">
          <Avatar
            src={me?.avatarUrl?.replace('localhost', '10.100.102.18')}
            alt={me?.username || 'User Avatar'}
            style={{
              width: '50px',
              height: '50px',
              backgroundColor: '#DFDAD6',
              border: '1px',
              borderStyle: 'solid',
              borderColor: '#CBC3BE'
            }}
            variant="circle"
            readOnly
          />
          <div className="flex-1">
            <Textarea
              value={text}
              onChange={handleTextChange}
              onPaste={handlePaste}
              placeholder={`What's on your mind, ${me?.username}?`}
              rows={6}
              className={cn(
                isAtLimit && 'border-destructive focus:ring-destructive'
              )}
            />
            <div className="flex justify-between items-center mt-2">
              <span
                className={cn(
                  'text-sm transition-colors',
                  isNearLimit ? 'text-destructive' : 'text-muted-foreground'
                )}
              >
                {charsLeft} characters left
              </span>
              <Button
                onClick={handlePost}
                disabled={isPending || !text.trim() || text.length > MAX_CHARS}
              >
                {isPending ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <div className="text-destructive text-center mt-4">
            Error: {(error as Error).message}
          </div>
        )}
      </div>
    </Container>
  );
};
