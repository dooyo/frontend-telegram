import { FC } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationBellProps {
  unreadCount: number;
  onClick: () => void;
}

export const NotificationBell: FC<NotificationBellProps> = ({
  unreadCount,
  onClick
}) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      aria-label={`${unreadCount} unread notifications`}
    >
      <div className="relative">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>
    </Button>
  );
};
