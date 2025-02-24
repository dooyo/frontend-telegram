import { FC, useRef, useCallback, useEffect } from 'react';
import { NotificationItem } from './NotificationItem';
import { NotificationType } from '@/lib/api/types';
import { Button } from '@/components/ui/button';

interface NotificationsListProps {
  notifications: NotificationType[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
  onRefresh: () => void;
  onNotificationRead: (id: string) => void;
  isRefreshing: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NotificationsList: FC<NotificationsListProps> = ({
  notifications,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  onLoadMore,
  onRefresh,
  onNotificationRead,
  onOpenChange
}) => {
  const observerTarget = useRef<HTMLDivElement>(null);

  // Intersection Observer callback
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        onLoadMore();
      }
    },
    [onLoadMore, hasNextPage, isFetchingNextPage]
  );

  // Set up the intersection observer
  useEffect(() => {
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-icon-default)]" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-[var(--color-text)]">
        <p>No notifications yet</p>
        <Button
          size="sm"
          onClick={onRefresh}
          className="mt-2 glass-card bg-primary hover:bg-primary/80 text-white shadow-lg transition-all duration-200 hover-scale"
        >
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-2">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification._id}
          notification={notification}
          onRead={() => onNotificationRead(notification._id)}
          onOpenChange={onOpenChange}
        />
      ))}

      {/* Loading indicator for next page */}
      <div ref={observerTarget} className="w-full py-4">
        {isFetchingNextPage && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[var(--color-icon-default)]" />
          </div>
        )}
      </div>
    </div>
  );
};
