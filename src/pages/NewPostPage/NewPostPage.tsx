import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createPost } from '@/lib/api/posts';
import { getMe } from '@/lib/api/profiles';
import { UserType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Avatar } from 'files-ui-react-19';
import { cn } from '@/lib/utils/cn';
import { MentionsInput } from '@/components/ui/mentions-input';
import { LimitsDisplay } from '@/components/LimitsDisplay/LimitsDisplay';
import { useLimits } from '@/context/LimitsContext';

const MAX_CHARS = 280;

export const NewPostPage: React.FC = () => {
  const [text, setText] = useState('');
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
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

  const { limits } = useLimits();
  const isAtLimit = limits?.posts.remaining === 0;

  const handleTextChange = useCallback((newText: string) => {
    if (newText.length <= MAX_CHARS) {
      setText(newText);
    }
  }, []);

  const handleMentionsChange = useCallback((users: string[]) => {
    setMentionedUserIds(users);
  }, []);

  const handlePost = async () => {
    if (!text.trim()) return;

    try {
      await mutateAsync({ text, mentionedUserIds } as any);
      setText('');
      setMentionedUserIds([]);
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

  return (
    <div className="flex flex-col items-center relative min-h-screen bg-background pb-[144px]">
      <Container className="w-full max-w-3xl px-4 py-4">
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
            <MentionsInput
              value={text}
              onChange={handleTextChange}
              onMentionsChange={handleMentionsChange}
              placeholder={`What's on your mind, ${me?.username}?`}
              maxLength={MAX_CHARS}
              rows={6}
              className={cn(
                'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
              )}
              disabled={isAtLimit}
            />
          </div>
        </div>

        {error && (
          <div className="text-destructive text-center mt-4">
            Error: {(error as Error).message}
          </div>
        )}
      </Container>

      <div className="fixed bottom-[56px] left-0 right-0 bg-background border-t">
        <div className="max-w-3xl mx-auto p-4 space-y-3">
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
              onClick={handlePost}
              disabled={
                isPending ||
                !text.trim() ||
                text.length > MAX_CHARS ||
                isAtLimit
              }
            >
              {isPending ? 'Posting...' : 'Post'}
            </Button>
          </div>
          <LimitsDisplay type="posts" showUpgradeButton={isAtLimit} />
        </div>
      </div>
    </div>
  );
};
