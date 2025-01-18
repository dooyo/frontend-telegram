import { FC, useRef, useCallback, useEffect } from 'react';
import { NotificationItem } from './NotificationItem';
import { NotificationType } from '@/lib/api/notifications';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface NotificationsListProps {
  notifications: NotificationType[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
  onRefresh: () => void;
  onNotificationRead: (id: string) => void;
  isRefreshing: boolean;
}

export const NotificationsList: FC<NotificationsListProps> = ({
  notifications,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  onLoadMore,
  onRefresh,
  onNotificationRead
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <p>No notifications yet</p>
        <Button variant="ghost" size="sm" onClick={onRefresh} className="mt-2">
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification._id}
          notification={notification}
          onRead={() => onNotificationRead(notification._id)}
        />
      ))}

      {/* Loading indicator for next page */}
      <div ref={observerTarget} className="w-full py-4">
        {isFetchingNextPage && (
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>
    </div>
  );
};
