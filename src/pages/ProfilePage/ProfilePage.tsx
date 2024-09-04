import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { UserType } from '@/lib/types';
import { getMe } from '@/lib/api/profiles';
import { timeUntil } from '@/lib/helpers/timeCompute';
import './ProfilePage.css';
import { Button } from '@/components/Button/Button';

export const ProfilePage: React.FC = () => {
  const { removeAuthToken } = useAuth() as any;

  const { data, isLoading, error } = useQuery<UserType>({
    queryKey: ['me'],
    queryFn: getMe
  });

  if (isLoading) {
    return <div className="loader">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error loading profile information.</div>;
  }

  const handleLogout = () => {
    removeAuthToken();
  };

  return (
    <div className="profile-container">
      {data?.avatarUrl ? (
        <img
          src={data.avatarUrl.replace('localhost', '10.100.102.18')}
          alt="Profile Avatar"
          className="profile-avatar"
        />
      ) : (
        <div className="placeholder-avatar"></div>
      )}
      <div className="profile-info">
        <p className="profile-text">
          <strong>Username:</strong> {data?.username}
        </p>
        <p className="profile-text">
          <strong>Email:</strong> {data?.email}
        </p>
        <p className="profile-text">
          <strong>Expires In:</strong>{' '}
          {data?.expiresAt ? timeUntil(data?.expiresAt) : 'NEVER'}
        </p>
        <Button disabled={false} onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
};
