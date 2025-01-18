import { FC } from 'react';
import { Bell, Heart, MessageCircle, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { NotificationType } from '@/lib/api/notifications';

interface NotificationItemProps {
  notification: NotificationType;
  onRead: (id: string) => void;
}

const notificationIcons = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus
} as const;

export const NotificationItem: FC<NotificationItemProps> = ({
  notification,
  onRead
}) => {
  const navigate = useNavigate();

  const Icon =
    notificationIcons[
      notification.type.toLowerCase() as keyof typeof notificationIcons
    ] || Bell;

  // Extract URL from content
  const urlMatch = notification.content.match(/https:\/\/[^\s]+/);
  const url = urlMatch ? urlMatch[0] : '';

  // Get content without URL
  const messageContent = notification.content
    .replace(url, '')
    .replace(/\n+/g, ' ')
    .trim();

  const handleClick = () => {
    if (!notification.isRead) {
      onRead(notification._id);
    }

    if (url) {
      // Extract startapp parameter from URL
      const startappParam = new URL(url).searchParams.get('startapp');
      if (startappParam) {
        const [type, id] = startappParam.split('_');
        navigate(`/${type}/${id}`);
      }
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'flex items-start gap-4 p-4 cursor-pointer transition-colors hover:bg-accent/50',
        !notification.isRead && 'bg-accent/20'
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      <div className="mt-1">
        <Icon
          className={cn(
            'h-5 w-5',
            notification.type.toLowerCase() === 'like' && 'text-red-500',
            notification.type.toLowerCase() === 'comment' && 'text-blue-500',
            notification.type.toLowerCase() === 'follow' && 'text-green-500'
          )}
        />
      </div>
      <div className="flex-1 space-y-1">
        <p className={cn('text-sm', !notification.isRead && 'font-medium')}>
          {messageContent}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true
          })}
        </p>
      </div>
    </div>
  );
};
