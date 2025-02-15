import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  useQuery,
  useInfiniteQuery,
  useQueryClient
} from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { getPost } from '@/lib/api/posts';
import { getPostComments } from '@/lib/api/comments';
import { Post } from '@/components/Post/Post';
import { Comment } from '@/components/Comment/Comment';
import { PostType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { CommentInput } from '@/components/CommentInput/CommentInput';
import { Helmet } from 'react-helmet';

const COMMENTS_PER_PAGE = 20;

export const PostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isRefreshing, setRefreshing] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const {
    data: post,
    isLoading: isLoadingPost,
    error: postError
  } = useQuery({
    queryKey: ['post', id],
    queryFn: () => getPost(id as string),
    retry: (failureCount, error) => {
      // Only retry if it's not a "Post not found" error
      return (error as Error).message !== 'Post not found' && failureCount < 3;
    }
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
    enabled: !!id && !postError // Don't fetch comments if post not found
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

  if (isLoadingPost || (isLoadingComments && !isRefreshing)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl text-primary animate-pulse">Loading...</div>
      </div>
    );
  }

  if (postError) {
    const isNotFound = (postError as Error).message === 'Post not found';
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-6">
        <div className="text-xl text-destructive font-medium">
          {!isNotFound && 'Failed to load post'}
        </div>
        {isNotFound && (
          <>
            <div className="text-muted-foreground text-sm">
              There's been something here... now it's in the void...
            </div>
            <img
              src="https://media.tenor.com/0IHINvvs6ccAAAAM/disintegrating-funny.gif"
              alt="Disintegrating GIF"
              className="rounded-lg shadow-lg w-64 h-64 object-cover"
            />
          </>
        )}
      </div>
    );
  }

  const allComments = commentsData?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className="flex flex-col items-center relative min-h-screen bg-background pb-[144px]">
      <Helmet>
        <meta property="og:title" content="DooYo Post" />
        <meta property="og:description" content={post?.text || ''} />
        <meta property="og:image" content={post?.user?.avatarUrl || ''} />
      </Helmet>
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
        <div className="max-w-3xl mx-auto p-4">
          <CommentInput postId={id as string} />
        </div>
      </div>
    </div>
  );
};
