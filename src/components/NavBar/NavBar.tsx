import { Home, Users, User } from 'lucide-react';
import { NavLink } from '@/components/ui/nav-link';
import { NotificationBell } from '@/components/Notifications/NotificationBell';
import { NotificationsModal } from '@/components/Notifications/NotificationsModal';
import { useNotifications } from '@/hooks/useNotifications';

export const NavBar = () => {
  const me = JSON.parse(localStorage.getItem('me') || '{}');
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
          <NavLink to="/feed" icon={<Home />} label="Feed" />
          <NavLink to="/friends" icon={<Users />} label="Friends" />
          {me._id && (
            <NavLink
              to={`/profile/${me._id}`}
              icon={<User />}
              label="Profile"
            />
          )}
          <div className="flex flex-col items-center justify-center">
            <NotificationBell
              unreadCount={unreadCount}
              onClick={openNotifications}
            />
            <span className="text-xs mt-1">Notifications</span>
          </div>
        </div>
      </nav>

      <NotificationsModal open={isOpen} onOpenChange={onOpenChange} />
    </>
  );
};
