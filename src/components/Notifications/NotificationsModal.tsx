import { FC, useState } from 'react';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { NotificationsList } from './NotificationsList';
import {
  getNotifications,
  markAsRead,
  markAllAsRead
} from '@/lib/api/notifications';

const NOTIFICATIONS_PER_PAGE = 20;

interface NotificationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NotificationsModal: FC<NotificationsModalProps> = ({
  open,
  onOpenChange
}) => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch
  } = useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: ({ pageParam }) =>
      getNotifications({
        cursor: pageParam,
        limit: NOTIFICATIONS_PER_PAGE
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    enabled: open
  });

  const { mutateAsync: markAsReadMutation } = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    }
  });

  const { mutateAsync: markAllAsReadMutation } = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    }
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleNotificationRead = async (id: string) => {
    try {
      await markAsReadMutation(id);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const allNotifications = data?.pages.flatMap((page) => page.data) ?? [];
  const hasUnread = allNotifications.some(
    (notification) => !notification.isRead
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg flex flex-col p-0"
      >
        <SheetHeader className="p-6 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle>Notifications</SheetTitle>
            {hasUnread && (
              <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                Mark all as read
              </Button>
            )}
          </div>
          <SheetDescription>
            View and manage your notifications
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
          <NotificationsList
            notifications={allNotifications}
            isLoading={isLoading}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            onLoadMore={fetchNextPage}
            onRefresh={handleRefresh}
            onNotificationRead={handleNotificationRead}
            isRefreshing={isRefreshing}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
