import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, User } from 'lucide-react';

export const NavBar: React.FC = () => {
  const me = JSON.parse(localStorage.getItem('me') || '{}');

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background shadow-lg z-50">
      <div className="flex justify-around items-center h-16">
        <NavLink
          to="/feed"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full ${
              isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-primary'
            }`
          }
          title="Feed"
        >
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Feed</span>
        </NavLink>
        <NavLink
          to="/friends"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full ${
              isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-primary'
            }`
          }
          title="Friends"
        >
          <Users className="h-6 w-6" />
          <span className="text-xs mt-1">Friends</span>
        </NavLink>
        {me._id && (
          <NavLink
            to={`/profile/${me._id}`}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary'
              }`
            }
            title="Profile"
          >
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Profile</span>
          </NavLink>
        )}
      </div>
    </nav>
  );
};
