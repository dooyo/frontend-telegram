import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery
} from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { getPost, postCommentOnPost } from '@/lib/api/posts';
import { getPostComments } from '@/lib/api/comments';
import { Post } from '@/components/Post/Post';
import { Comment } from '@/components/Comment/Comment';
import { PostType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  MentionsInput,
  MAX_CONTENT_LENGTH
} from '@/components/ui/mentions-input';
import { cn } from '@/lib/utils/cn';

const COMMENTS_PER_PAGE = 20;

export const PostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [commentText, setCommentText] = useState('');
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const [isRefreshing, setRefreshing] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();

  const {
    data: post,
    isLoading: isLoadingPost,
    error: postError
  } = useQuery({
    queryKey: ['post', id],
    queryFn: () => getPost(id as string)
  });

  const {
    data: commentsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingComments,
    refetch: refetchComments
  } = useInfiniteQuery({
    queryKey: ['comments', id],
    queryFn: ({ pageParam }) =>
      getPostComments(id as string, {
        cursor: pageParam,
        limit: COMMENTS_PER_PAGE,
        sortField: 'createdAt',
        sortOrder: 'asc'
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: !!id
  });

  const { mutateAsync: postComment, isPending } = useMutation({
    mutationFn: (comment: string) =>
      postCommentOnPost(id as string, {
        text: comment,
        mentionedUserIds
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
      setCommentText('');
      setMentionedUserIds([]); // Clear mentioned users after successful post
    }
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['post', id] }),
      refetchComments()
    ]);
    setRefreshing(false);
  };

  // Intersection Observer callback
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  // Set up the intersection observer
  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: '100px' // Load more comments before reaching the bottom
    });

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [handleObserver]);

  const handleCommentChange = useCallback((text: string) => {
    if (text.length <= MAX_CONTENT_LENGTH) {
      setCommentText(text);
    }
  }, []);

  const handleMentionsChange = useCallback((users: string[]) => {
    setMentionedUserIds(users);
  }, []);

  const handlePostComment = async () => {
    if (commentText.trim() && commentText.length <= MAX_CONTENT_LENGTH) {
      try {
        await postComment(commentText);
      } catch (error) {
        console.error('Error posting comment:', error);
      }
    }
  };

  if (isLoadingPost || (isLoadingComments && !isRefreshing)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl text-primary animate-pulse">Loading...</div>
      </div>
    );
  }

  if (postError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-destructive">Post not found</div>
      </div>
    );
  }

  const allComments = commentsData?.pages.flatMap((page) => page.data) ?? [];
  const remainingChars = MAX_CONTENT_LENGTH - commentText.length;

  return (
    <div className="flex flex-col items-center relative min-h-screen bg-background pb-[144px]">
      <div className="w-full max-w-3xl px-4">
        <Post post={post as PostType} />

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="mt-4 w-full"
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>

        <div className="mt-6 space-y-4">
          {allComments.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              But it feels so empty without me...
            </div>
          ) : (
            <div className="space-y-4">
              {allComments.map((comment) => (
                <Comment key={comment._id} comment={comment} />
              ))}
            </div>
          )}

          {/* Loading indicator for next page */}
          <div ref={observerTarget} className="w-full py-4">
            {isFetchingNextPage && (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-[56px] left-0 right-0 bg-background border-t">
        <div className="max-w-3xl mx-auto p-4 space-y-2">
          {isPending && (
            <div className="text-sm text-muted-foreground">Commenting...</div>
          )}
          <div className="flex flex-col gap-2">
            <div className="relative">
              <MentionsInput
                value={commentText}
                onChange={handleCommentChange}
                onMentionsChange={handleMentionsChange}
                placeholder="Write a comment..."
                maxLength={MAX_CONTENT_LENGTH}
                className={cn(
                  'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-16',
                  remainingChars <= 20 && 'focus-visible:ring-warning',
                  remainingChars === 0 && 'focus-visible:ring-destructive'
                )}
              />
              <span
                className={cn(
                  'absolute right-6 top-3 text-xs px-2 bg-background',
                  remainingChars <= 20
                    ? 'text-warning'
                    : 'text-muted-foreground',
                  remainingChars === 0 && 'text-destructive'
                )}
              >
                {remainingChars}
              </span>
            </div>
            <Button
              onClick={handlePostComment}
              disabled={
                isPending ||
                !commentText.trim() ||
                commentText.length > MAX_CONTENT_LENGTH
              }
              className="w-full"
            >
              Comment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
