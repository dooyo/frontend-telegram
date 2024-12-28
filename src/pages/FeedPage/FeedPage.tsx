import { FC, useState, useEffect, useRef, useCallback } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getPosts } from '@/lib/api/posts';
import { getMyFollowings } from '@/lib/api/followers';
import { Post } from '@/components/Post/Post';
import { Link } from 'react-router-dom';
import { PostType } from '@/lib/types';
import { PenSquare, Users, Hourglass } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { cn } from '@/lib/utils/cn';

const POSTS_PER_PAGE = 20;

type FilterType = 'none' | 'frens' | 'fading';

export const FeedPage: FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('none');
  const observerTarget = useRef<HTMLDivElement>(null);

  // Query to get following users
  const { data: followingData } = useQuery({
    queryKey: ['following'],
    queryFn: getMyFollowings,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Safely get following IDs, filtering out any deleted users
  const followingIds =
    followingData
      ?.filter((following) => following.user && following.user._id)
      ?.map((following) => following.user._id) || [];

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ['posts', activeFilter, followingIds],
    queryFn: ({ pageParam }) => {
      const params = {
        cursor: pageParam,
        limit: POSTS_PER_PAGE,
        sortField: activeFilter === 'fading' ? 'expiresAt' : 'createdAt',
        sortOrder:
          activeFilter === 'fading' ? 'asc' : ('desc' as 'asc' | 'desc')
      };

      if (activeFilter === 'frens' && followingIds.length > 0) {
        return getPosts({ ...params, userIds: followingIds });
      }

      return getPosts(params);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled:
      activeFilter !== 'frens' ||
      (activeFilter === 'frens' && followingIds.length > 0)
  });

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleFilterClick = (filter: FilterType) => {
    setActiveFilter((currentFilter) =>
      currentFilter === filter ? 'none' : filter
    );
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
      rootMargin: '100px' // Load more posts before reaching the bottom
    });

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [handleObserver]);

  if (isLoading && !isRefreshing) {
    return (
      <Container className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container>
        <p className="text-destructive text-center mt-4">
          Error: {(error as Error).message}
        </p>
      </Container>
    );
  }

  const allPosts = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <Container className="pb-20">
      <div className="flex flex-col items-center w-full">
        <div className="flex gap-2 mt-4 mb-4">
          <Button
            onClick={() => handleFilterClick('frens')}
            variant={activeFilter === 'frens' ? 'default' : 'outline'}
            className={cn(
              'flex items-center gap-2',
              activeFilter === 'frens' && 'bg-primary text-primary-foreground'
            )}
          >
            <Users className="w-4 h-4" />
            Frens
          </Button>
          <Button
            onClick={() => handleFilterClick('fading')}
            variant={activeFilter === 'fading' ? 'default' : 'outline'}
            className={cn(
              'flex items-center gap-2',
              activeFilter === 'fading' && 'bg-primary text-primary-foreground'
            )}
          >
            <Hourglass className="w-4 h-4" />
            Fading
          </Button>
          <Button onClick={onRefresh} disabled={isRefreshing} variant="default">
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {activeFilter === 'frens' && followingIds.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            You're not following anyone yet. Follow some users to see their
            posts here!
          </div>
        ) : (
          <>
            <ul className="w-full max-w-2xl space-y-4">
              {allPosts.map((post: PostType) => (
                <li key={post._id}>
                  <Post post={post} />
                </li>
              ))}
            </ul>

            {/* Loading indicator for next page */}
            <div ref={observerTarget} className="w-full py-8">
              {isFetchingNextPage && (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              )}
              {!hasNextPage && allPosts.length > 0 && (
                <p className="text-center text-muted-foreground">
                  No more posts to load
                </p>
              )}
            </div>
          </>
        )}

        <Button
          asChild
          className="fixed bottom-20 right-4 sm:right-8 z-50 rounded-full w-14 h-14 p-0"
          size="icon"
        >
          <Link
            to="/newPost"
            className={buttonVariants({
              variant: 'default',
              size: 'icon',
              className:
                'fixed bottom-20 right-4 sm:right-8 z-50 rounded-full w-14 h-14 p-0'
            })}
          >
            <PenSquare className="w-6 h-6" />
            <span className="sr-only">Create new post</span>
          </Link>
        </Button>
      </div>
    </Container>
  );
};
