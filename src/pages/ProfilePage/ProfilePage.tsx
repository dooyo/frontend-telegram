import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { UserType } from '@/lib/types';
import { getMe, getProfileById, getProfileStatsById } from '@/lib/api/profiles';
import {
  postFollow,
  isMeFollowingUser,
  isUserFollowingMe
} from '@/lib/api/followers';
import { timeDurationCalculator, timeUntil } from '@/lib/helpers/timeCompute';
import './ProfilePage.css';
import { Button } from '@/components/Button/Button';
import { Avatar } from '@files-ui/react';
import { useParams } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { removeAuthToken } = useAuth() as any;
  const { id: userId } = useParams<{ id: string }>();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isUserFollowing, setIsUserFollowing] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  const { data: me, isLoading: isLoadingMe } = useQuery<UserType>({
    queryKey: ['me'],
    queryFn: getMe
  });

  // Fetch profile of the viewed user
  const {
    data: userData,
    isLoading: isLoadingUser,
    error: userError,
    refetch
  } = useQuery<UserType>({
    queryKey: ['user', userId],
    queryFn: () => getProfileById(userId as string),
    enabled: !!userId && userId !== me?._id
  });

  // Fetch profile stats of the viewed user
  const { data: userStats } = useQuery({
    queryKey: ['userStats', userId],
    queryFn: () => getProfileStatsById(userId as string),
    enabled: !!userId && userId !== me?._id
  });

  // Mutation for follow/unfollow
  const { mutateAsync: followMutation, isPending: isFollowPending } =
    useMutation({
      mutationFn: postFollow,
      onSuccess: () => {
        setIsFollowing((prev) => !prev);
        refetch();
      }
    });

  useEffect(() => {
    if (me && userId) {
      setIsCurrentUser(me._id === userId);
    }

    const fetchFollowersStatus = async () => {
      if (userId && userId !== me?._id) {
        const iFollow = await isMeFollowingUser(userId);
        const userFollowsMe = await isUserFollowingMe(userId);
        setIsFollowing(iFollow);
        setIsUserFollowing(userFollowsMe);
      }
    };

    fetchFollowersStatus();
  }, [me, userId]);

  if (isLoadingMe || isLoadingUser) {
    return <div className="loader">Loading...</div>;
  }

  if (userError) {
    return <div className="error">Error loading profile information.</div>;
  }

  const handleLogout = () => {
    removeAuthToken();
  };

  const handleFollow = async () => {
    try {
      await followMutation(userData?._id as any);
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    }
  };

  return (
    <div className="profile-container">
      {userData?.avatarUrl ? (
        <Avatar
          src={userData.avatarUrl.replace('localhost', '10.100.102.18')}
          alt="user avatar"
          style={{
            width: '250px',
            height: '250px',
            backgroundColor: '#DFDAD6',
            border: '1px',
            borderStyle: 'solid',
            borderColor: '#CBC3BE',
            marginRight: '10px'
          }}
          variant="circle"
          readOnly
        />
      ) : (
        <div className="placeholder-avatar"></div>
      )}
      <div className="profile-info">
        <p className="profile-text">
          <strong>Username:</strong> {userData?.username}
        </p>
        <p className="profile-text">
          <strong>Email:</strong> {userData?.email}
        </p>
        <p className="profile-text">
          <strong>Expires In:</strong>{' '}
          {userData?.expiresAt ? timeUntil(userData?.expiresAt) : 'NEVER'}
        </p>
        <p>
          <strong>Stats:</strong>
          {userStats && (
            <ul>
              <li>Comments: {userStats.totalComments}</li>
              <li>Comments Likes: {userStats.totalCommentsLikes}</li>
              <li>Comments Dislikes: {userStats.totalCommentsDislikes}</li>
              <li>
                Comments Duration:{' '}
                {timeDurationCalculator(userStats.totalCommentsDuration)}
              </li>
              <li>Posts: {userStats.totalPosts}</li>
              <li>Posts Likes: {userStats.totalPostsLikes}</li>
              <li>Posts Dislikes: {userStats.totalPostsDislikes}</li>
              <li>
                Posts Duration:{' '}
                {timeDurationCalculator(userStats.totalPostsDuration)}
              </li>
            </ul>
          )}
        </p>
        {isCurrentUser ? (
          <Button disabled={false} onClick={handleLogout}>
            Logout
          </Button>
        ) : (
          <>
            <Button disabled={isFollowPending} onClick={handleFollow}>
              {isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
            {isUserFollowing && (
              <p className="profile-text">This user is following you 🤗</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};
