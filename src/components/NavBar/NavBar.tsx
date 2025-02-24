import { Home, Users, User, Bell } from 'lucide-react';
import { NavLink } from '@/components/ui/nav-link';
import { NotificationsModal } from '@/components/Notifications/NotificationsModal';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils/cn';

export const NavBar = () => {
  const { user } = useAuth();
  const { isOpen, unreadCount, openNotifications, onOpenChange } =
    useNotifications();

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 glass-card border-t border-white/20">
        <div className="flex justify-around items-center h-16 px-2">
          <NavLink
            to="/"
            icon={<Home className="w-6 h-6" />}
            label="Feed"
            end
          />
          <NavLink
            to="/friends"
            icon={<Users className="w-6 h-6" />}
            label="Friends"
          />
          {user?._id && (
            <NavLink
              to={`/profile/${user._id}`}
              icon={<User className="w-6 h-6" />}
              label="Profile"
            />
          )}
          <button
            onClick={openNotifications}
            className={cn(
              'flex flex-col items-center space-y-1 px-3 py-1 rounded-lg transition-colors',
              isOpen
                ? 'text-primary bg-white/10'
                : 'text-[var(--color-icon-default)] hover:bg-white/5'
            )}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && openNotifications()}
            aria-label="Notifications"
          >
            <div className="relative">
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
            <span className="text-xs">Notifs</span>
          </button>
        </div>
      </nav>

      <NotificationsModal open={isOpen} onOpenChange={onOpenChange} />
    </>
  );
};
