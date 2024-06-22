import React from 'react';
import { NavLink } from 'react-router-dom';
import './NavBar.css';

const NavBar: React.FC = () => {
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
      <NavLink
        to="/profile"
        className={({ isActive }) =>
          isActive ? 'nav-link active' : 'nav-link'
        }
      >
        Profile
      </NavLink>
    </div>
  );
};

export default NavBar;
