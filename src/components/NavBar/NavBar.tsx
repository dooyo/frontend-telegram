import React from 'react';
import { NavLink } from 'react-router-dom';
import './NavBar.css';

export const NavBar: React.FC = () => {
  const me = JSON.parse(localStorage.getItem('me') || '{}');

  return (
    <div className="navbar">
      <NavLink
        to="/feed"
        className={({ isActive }) =>
          isActive ? 'nav-link active' : 'nav-link'
        }
      >
        Feed
      </NavLink>
      <NavLink
        to="/friends"
        className={({ isActive }) =>
          isActive ? 'nav-link active' : 'nav-link'
        }
      >
        Friends
      </NavLink>
      {me._id && (
        <NavLink
          to={`/profile/${me._id}`}
          className={({ isActive }) =>
            isActive ? 'nav-link active' : 'nav-link'
          }
        >
          Profile
        </NavLink>
      )}
    </div>
  );
};
