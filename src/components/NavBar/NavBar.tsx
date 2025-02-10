import { Home, Users, User, Bell } from 'lucide-react';
import { NavLink } from '@/components/ui/nav-link';
import { NotificationsModal } from '@/components/Notifications/NotificationsModal';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/context/AuthContext';

export const NavBar = () => {
  const { user } = useAuth();
  const { isOpen, unreadCount, openNotifications, onOpenChange } =
    useNotifications();

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 bg-background shadow-lg z-50"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex justify-around items-center h-16">
          <NavLink
            to="/feed"
            icon={<Home className="h-6 w-6" />}
            label="Feed"
          />
          <NavLink
            to="/friends"
            icon={<Users className="h-6 w-6" />}
            label="Friends"
          />
          {user?._id && (
            <NavLink
              to={`/profile/${user._id}`}
              icon={<User className="h-6 w-6" />}
              label="Profile"
            />
          )}
          <div
            className="flex flex-col items-center justify-center w-full h-full transition-colors text-muted-foreground hover:text-primary cursor-pointer"
            onClick={openNotifications}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && openNotifications()}
            aria-label="Notifications"
          >
            <div className="h-6 w-6 relative">
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
            <span className="text-xs mt-1">Notifs</span>
          </div>
        </div>
      </nav>

      <NotificationsModal open={isOpen} onOpenChange={onOpenChange} />
    </>
  );
};
