import { FC } from 'react';
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  PenSquare,
  Award,
  AtSign
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { NotificationType } from '@/lib/api/types';

interface NotificationItemProps {
  notification: NotificationType;
  onRead: (id: string) => void;
  onOpenChange: (open: boolean) => void;
}

const notificationIcons = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  fren_post: PenSquare,
  reward: Award,
  mention: AtSign
} as const;

export const NotificationItem: FC<NotificationItemProps> = ({
  notification,
  onRead,
  onOpenChange
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
        onOpenChange(false); // Close modal before navigation
        navigate(`/${type}/${id}`);
      }
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'glass-card p-4 cursor-pointer transition-all duration-200 hover-scale',
        !notification.isRead && 'bg-white/10'
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      <div className="flex items-start gap-4">
        <div className="mt-1">
          <Icon
            className={cn(
              'h-5 w-5',
              notification.type.toLowerCase() === 'like' && 'text-rose-500',
              notification.type.toLowerCase() === 'comment' && 'text-blue-500',
              notification.type.toLowerCase() === 'follow' &&
                'text-emerald-500',
              notification.type.toLowerCase() === 'fren_post' &&
                'text-violet-500',
              notification.type.toLowerCase() === 'reward' && 'text-amber-500',
              notification.type.toLowerCase() === 'mention' && 'text-cyan-500'
            )}
          />
        </div>
        <div className="flex-1 space-y-1">
          <p
            className={cn(
              'text-sm text-[var(--color-text)]',
              !notification.isRead && 'font-medium'
            )}
          >
            {messageContent}
          </p>
          <p className="text-xs text-[var(--color-icon-default)]">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true
            })}
          </p>
        </div>
      </div>
    </div>
  );
};
