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
        className="flex items-center p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => {
          if (!isDeletedUser) {
            navigate(`/profile/${user._id}`);
          }
        }}
        style={{ cursor: isDeletedUser ? 'default' : 'pointer' }}
      >
        <Avatar
          src={user?.avatarUrl?.replace('localhost', '10.100.102.18')}
          alt={user?.username || 'Deleted User'}
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
        <span className="flex-1 ml-2.5">
          {isDeletedUser ? 'Deleted User' : `@${user.username}`}
        </span>
        {tabIndex === 1 && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleUnfollow(user._id);
            }}
            disabled={false}
            className="text-sm"
          >
            Unfollow
          </Button>
        )}
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
    <Container>
      <div className="space-y-4">
        <div className="sticky top-0 bg-background pt-4 pb-2 space-y-4 z-10 border-b border-input-border">
          <Input
            type="text"
            placeholder={`Search my ${
              tabIndex === 0 ? 'followers' : 'followings'
            }`}
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery}
            onReset={() => setSearchQuery('')}
          />
          <div className="flex">
            <div
              className={`flex-1 text-center py-2 cursor-pointer border-b-2 ${
                tabIndex === 0 ? 'border-primary' : 'border-transparent'
              }`}
              onClick={() => handleTabChange(0)}
            >
              <span className="font-medium">Followers</span>
              <span className="ml-2 text-sm text-muted-foreground">
                {followersCount}
              </span>
            </div>
            <div
              className={`flex-1 text-center py-2 cursor-pointer border-b-2 ${
                tabIndex === 1 ? 'border-primary' : 'border-transparent'
              }`}
              onClick={() => handleTabChange(1)}
            >
              <span className="font-medium">Following</span>
              <span className="ml-2 text-sm text-muted-foreground">
                {followingsCount}
              </span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div>
            {filteredData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No {tabIndex === 0 ? 'followers' : 'following'} found
              </div>
            ) : (
              <div className="divide-y divide-input-border">
                {filteredData.map((item) => renderUser(item))}

                {/* Loading indicator for next page */}
                <div ref={observerTarget} className="w-full py-4">
                  {isFetchingNext && (
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Link
        to="/friendsSearch"
        className="fixed bottom-20 right-4 sm:right-8 z-50 rounded-full w-14 h-14 bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
      >
        <UserPlus className="w-6 h-6" />
        <span className="sr-only">Add new friends</span>
      </Link>
    </Container>
  );
};
