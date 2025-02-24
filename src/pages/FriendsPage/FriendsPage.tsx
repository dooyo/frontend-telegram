import React, { useState, useRef, useCallback } from 'react';
import {
  getMyFollowers,
  getMyFollowings,
  postFollow
} from '@/lib/api/followers';
import { Following } from '@/lib/types';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar } from 'files-ui-react-19';
import { Input } from '@/components/Input/Input';
import { Button } from '@/components/Button/Button';
import { UserPlus } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils/cn';
import { motion } from 'framer-motion';

const ITEMS_PER_PAGE = 20;

export const FriendsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tabIndex, setTabIndex] = useState(0);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const observerTarget = useRef<HTMLDivElement>(null);

  const {
    data: followersData,
    fetchNextPage: fetchNextFollowers,
    hasNextPage: hasMoreFollowers,
    isFetchingNextPage: isFetchingNextFollowers,
    isLoading: isLoadingFollowers,
    refetch: refetchFollowers
  } = useInfiniteQuery({
    queryKey: ['followers'],
    queryFn: ({ pageParam }) => {
      return getMyFollowers({
        cursor: pageParam,
        limit: ITEMS_PER_PAGE
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined
  });

  const {
    data: followingsData,
    fetchNextPage: fetchNextFollowings,
    hasNextPage: hasMoreFollowings,
    isFetchingNextPage: isFetchingNextFollowings,
    isLoading: isLoadingFollowings,
    refetch: refetchFollowings
  } = useInfiniteQuery({
    queryKey: ['followings'],
    queryFn: ({ pageParam }) => {
      return getMyFollowings({
        cursor: pageParam,
        limit: ITEMS_PER_PAGE
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined
  });

  // Refetch active tab data when switching tabs
  const handleTabChange = (newTabIndex: number) => {
    setTabIndex(newTabIndex);
    if (newTabIndex === 0) {
      refetchFollowers();
    } else {
      refetchFollowings();
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      await postFollow(userId);
      queryClient.invalidateQueries({ queryKey: ['followings'] });
    } catch (error) {
      console.error('Failed to unfollow user:', error);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      await postFollow(userId);
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['followings'] });
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  };

  // Intersection Observer callback
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting) {
        if (tabIndex === 0 && hasMoreFollowers && !isFetchingNextFollowers) {
          fetchNextFollowers();
        } else if (
          tabIndex === 1 &&
          hasMoreFollowings &&
          !isFetchingNextFollowings
        ) {
          fetchNextFollowings();
        }
      }
    },
    [
      tabIndex,
      hasMoreFollowers,
      hasMoreFollowings,
      isFetchingNextFollowers,
      isFetchingNextFollowings,
      fetchNextFollowers,
      fetchNextFollowings
    ]
  );

  // Set up the intersection observer
  React.useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: '100px'
    });

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [handleObserver]);

  const renderUser = (item: Following) => {
    const user = tabIndex === 0 ? item.followerUser : item.user;
    const isDeletedUser = !user || !user.username;

    return (
      <div
        key={user?._id || item._id}
        className="glass-card p-4 transition-all duration-200 hover:scale-[1.02] cursor-pointer"
        onClick={() => {
          if (!isDeletedUser) {
            navigate(`/profile/${user._id}`);
          }
        }}
      >
        <div className="flex items-center gap-3">
          <Avatar
            src={user?.avatarUrl?.replace('localhost', '10.100.102.18')}
            alt={user?.username || 'Deleted User'}
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#DFDAD6',
              border: '1px solid #CBC3BE',
              borderRadius: '50%'
            }}
            variant="circle"
            readOnly
          />
          <div className="flex flex-col flex-1">
            <span className="font-medium text-foreground">
              {isDeletedUser ? 'Deleted User' : user.username}
            </span>
            <span className="text-sm text-muted-foreground">
              {isDeletedUser ? '' : `@${user.username}`}
            </span>
          </div>
          {tabIndex === 1 ? (
            <Button
              disabled={false}
              className={cn(
                'rounded-full px-4 py-1 text-sm font-medium',
                'bg-[#F0CFD4] hover:bg-[#F0CFD4]/80',
                'text-primary hover:text-primary/90',
                'transition-colors duration-200'
              )}
              onClick={(e) => {
                e.stopPropagation();
                handleUnfollow(user._id);
              }}
            >
              Unfollow
            </Button>
          ) : (
            // TODO: Update backend's response and change to
            // !item.isFollowingBack && (
            item.isFollowingBack && (
              <Button
                disabled={false}
                className={cn(
                  'rounded-full px-4 py-1 text-sm font-medium',
                  'bg-[#F0CFD4] hover:bg-[#F0CFD4]/80',
                  'text-primary hover:text-primary/90',
                  'transition-colors duration-200'
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  handleFollow(user._id);
                }}
              >
                Follow
              </Button>
            )
          )}
        </div>
      </div>
    );
  };

  const currentData = tabIndex === 0 ? followersData : followingsData;
  const allItems = currentData?.pages.flatMap((page) => page.data) ?? [];
  const isLoading = tabIndex === 0 ? isLoadingFollowers : isLoadingFollowings;
  const isFetchingNext =
    tabIndex === 0 ? isFetchingNextFollowers : isFetchingNextFollowings;

  const filteredData = allItems.filter((following) => {
    const username =
      tabIndex === 0
        ? following?.followerUser?.username
        : following?.user?.username;

    if (!username) return false;
    if (!searchQuery) return true;

    return username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const followersCount = followersData?.pages[0]?.total ?? 0;
  const followingsCount = followingsData?.pages[0]?.total ?? 0;

  return (
    <div className="min-h-screen">
      <Container>
        <div className="space-y-4 p-4">
          <div className="sticky top-0 space-y-4 z-10">
            {/* Search Input */}
            <div className="glass-card rounded-2xl p-2">
              <Input
                type="text"
                placeholder={`Search my ${
                  tabIndex === 0 ? 'followers' : 'followings'
                }`}
                onChange={(e) => setSearchQuery(e.target.value)}
                value={searchQuery}
                onReset={() => setSearchQuery('')}
                containerClassName="bg-transparent"
                inputClassName="text-sm font-medium"
              />
            </div>

            {/* Tabs Card */}
            <div className="glass-card rounded-2xl p-1 flex relative">
              {/* Sliding Background */}
              <motion.div
                className="absolute h-full w-1/2 bg-white/10 rounded-xl"
                animate={{ x: tabIndex === 0 ? '0%' : '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />

              {/* Followers Tab */}
              <button
                className={cn(
                  'flex-1 relative py-2 rounded-xl transition-colors',
                  'font-medium text-sm',
                  tabIndex === 0 ? 'text-primary' : 'text-muted-foreground'
                )}
                onClick={() => handleTabChange(0)}
              >
                <span>Followers</span>
                <span className="ml-1 text-muted-foreground">
                  {followersCount}
                </span>
              </button>

              {/* Following Tab */}
              <button
                className={cn(
                  'flex-1 relative py-2 rounded-xl transition-colors',
                  'font-medium text-sm',
                  tabIndex === 1 ? 'text-primary' : 'text-muted-foreground'
                )}
                onClick={() => handleTabChange(1)}
              >
                <span>Following</span>
                <span className="ml-1 text-muted-foreground">
                  {followingsCount}
                </span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {filteredData.map((item) => renderUser(item))}
          </div>

          {/* Loading states */}
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground glass-card rounded-lg">
              No {tabIndex === 0 ? 'followers' : 'following'} found
            </div>
          ) : (
            <div ref={observerTarget} className="w-full py-4">
              {isFetchingNext && (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              )}
            </div>
          )}

          {/* Add friend button */}
          <Link
            to="/friendsSearch"
            className={cn(
              'fixed bottom-20 right-4 sm:right-8 z-50 rounded-full w-14 h-14',
              'bg-[var(--color-text)] hover:bg-[var(--color-text)]/90 text-white shadow-lg',
              'flex items-center justify-center',
              'transition-all duration-200 hover-scale'
            )}
          >
            <UserPlus className="w-6 h-6" />
            <span className="sr-only">Add new friends</span>
          </Link>
        </div>
      </Container>
    </div>
  );
};
