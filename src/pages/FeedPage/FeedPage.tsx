import { FC, useState, useEffect, useRef, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getPosts } from '@/lib/api/posts';
import { getMyFollowings } from '@/lib/api/followers';
import { Post } from '@/components/Post/Post';
import { Link } from 'react-router-dom';
import { PostType } from '@/lib/types';
import { PenSquare, Users, RotateCw } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { cn } from '@/lib/utils/cn';

const POSTS_PER_PAGE = 20;
const FOLLOWINGS_PER_PAGE = 50; // We can load more followings at once since we need the full list for filtering

type FilterType = 'none' | 'frens' | 'fading';

export const FeedPage: FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('none');
  const observerTarget = useRef<HTMLDivElement>(null);

  // Query to get following users with pagination
  const {
    data: followingData,
    hasNextPage: hasMoreFollowings,
    fetchNextPage: fetchNextFollowings,
    isFetchingNextPage: isFetchingNextFollowings
  } = useInfiniteQuery({
    queryKey: ['following'],
    queryFn: ({ pageParam }) =>
      getMyFollowings({
        cursor: pageParam,
        limit: FOLLOWINGS_PER_PAGE
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Load all following pages if there are more
  useEffect(() => {
    if (hasMoreFollowings && !isFetchingNextFollowings) {
      fetchNextFollowings();
    }
  }, [hasMoreFollowings, isFetchingNextFollowings, fetchNextFollowings]);

  // Safely get following IDs, filtering out any deleted users
  const followingIds =
    followingData?.pages
      .flatMap((page) => page.data)
      .filter((following) => following.user && following.user._id)
      .map((following) => following.user._id) || [];

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
      <div className="min-h-screen">
        <Container className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
          <div className="animate-float">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white/80"></div>
          </div>
        </Container>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen">
        <Container>
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
            <p className="text-white/80 text-center mt-4 animate-fade-up">
              Error: {(error as Error).message}
            </p>
            <Button
              onClick={() => refetch()}
              className="glass-button hover-scale mt-4 animate-fade-up"
            >
              Try Again
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  const allPosts = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className="min-h-screen">
      <Container className="px-4 pb-20 pt-4">
        <div className="flex flex-col items-center w-full">
          <div className="filters-scroll flex items-center gap-2 mb-6 overflow-x-auto py-2 w-full max-w-3xl mx-auto">
            <Button
              onClick={() => handleFilterClick('frens')}
              className={cn(
                'rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-[var(--color-icon-default)] hover:bg-white/20 transition-colors duration-200',
                activeFilter === 'frens' &&
                  'bg-white/30 border-primary/50 text-primary'
              )}
            >
              Frens
            </Button>
            <Button
              onClick={() => handleFilterClick('fading')}
              className={cn(
                'rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-[var(--color-icon-default)] hover:bg-white/20 transition-colors duration-200',
                activeFilter === 'fading' &&
                  'bg-white/30 border-primary/50 text-primary'
              )}
            >
              Fading
            </Button>
            <Button
              onClick={onRefresh}
              disabled={isRefreshing}
              size="icon"
              className={cn(
                'rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-foreground hover:bg-white/20 ml-auto transition-colors duration-200',
                isRefreshing && 'animate-spin'
              )}
              aria-label="Refresh posts"
            >
              <RotateCw className="w-4 h-4 text-[#B4A5FF]" />
            </Button>
          </div>

          {activeFilter === 'frens' && followingIds.length === 0 ? (
            <div className="glass-card flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-up max-w-md mx-auto">
              <Users className="w-12 h-12 mb-4 text-white" />
              <p className="text-lg mb-4 text-white">
                You're not following anyone yet
              </p>
              <p className="text-sm mb-6 text-white/80">
                Follow some users to see their posts here!
              </p>
              <Button
                asChild
                variant="outline"
                className="glass-card hover-scale"
              >
                <Link to="/friends">Find Friends</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="w-full max-w-3xl mx-auto space-y-4">
                {allPosts.map((post: PostType) => (
                  <div
                    key={`${post._id}-${activeFilter}`}
                    className="hover-scale"
                  >
                    <Post post={post} />
                  </div>
                ))}
              </div>

              <div ref={observerTarget} className="w-full py-8">
                {isFetchingNextPage && (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                  </div>
                )}
                {!hasNextPage && allPosts.length > 0 && (
                  <p className="text-center text-[var(--color-icon-default)]">
                    You've caught up! No more posts to load
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </Container>

      <Button
        asChild
        className={cn(
          buttonVariants({
            variant: 'default',
            size: 'icon',
            className:
              'fixed bottom-20 right-4 sm:right-8 z-50 rounded-full w-14 h-14 p-0 bg-[var(--color-text)] hover:bg-[var(--color-text)]/90 text-white shadow-lg transition-all duration-200 hover-scale'
          })
        )}
      >
        <Link to="/newPost">
          <PenSquare className="w-6 h-6" />
          <span className="sr-only">Create new post</span>
        </Link>
      </Button>
    </div>
  );
};
