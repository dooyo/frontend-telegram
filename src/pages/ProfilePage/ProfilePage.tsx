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
import { Button } from '@/components/Button/Button';
import { Avatar } from '@files-ui/react';
import { useParams } from 'react-router-dom';
import { Container } from '@/components/ui/container';
import { cn } from '@/lib/utils/cn';

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

  const { data: userStats } = useQuery({
    queryKey: ['userStats', userId],
    queryFn: () => getProfileStatsById(userId as string),
    enabled: !!userId && userId !== me?._id
  });

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
    return (
      <Container className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </Container>
    );
  }

  if (userError) {
    return (
      <Container>
        <div className="text-destructive text-center mt-4">
          Error loading profile information.
        </div>
      </Container>
    );
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
    <Container className="py-8">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="flex-shrink-0">
          {userData?.avatarUrl ? (
            <div className="relative w-64 h-64 rounded-full overflow-hidden border border-input-border bg-input-background">
              <Avatar
                src={userData.avatarUrl.replace('localhost', '10.100.102.18')}
                alt={`${userData.username}'s avatar`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                variant="circle"
                readOnly
              />
            </div>
          ) : (
            <div className="w-64 h-64 rounded-full bg-input-background border border-input-border flex items-center justify-center">
              <span className="text-4xl text-muted-foreground">
                {userData?.username?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
          )}
        </div>

        <div className="flex-grow space-y-6 max-w-2xl">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">{userData?.username}</h1>
            <p className="text-muted-foreground">{userData?.email}</p>
            <p className="text-sm">
              Expires in:{' '}
              {userData?.expiresAt ? timeUntil(userData?.expiresAt) : 'NEVER'}
            </p>
          </div>

          {userStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h2 className="font-medium">Comments</h2>
                <ul className="space-y-1 text-sm">
                  <li>Total: {userStats.totalComments}</li>
                  <li>Likes: {userStats.totalCommentsLikes}</li>
                  <li>Dislikes: {userStats.totalCommentsDislikes}</li>
                  <li>
                    Duration:{' '}
                    {timeDurationCalculator(userStats.totalCommentsDuration)}
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h2 className="font-medium">Posts</h2>
                <ul className="space-y-1 text-sm">
                  <li>Total: {userStats.totalPosts}</li>
                  <li>Likes: {userStats.totalPostsLikes}</li>
                  <li>Dislikes: {userStats.totalPostsDislikes}</li>
                  <li>
                    Duration:{' '}
                    {timeDurationCalculator(userStats.totalPostsDuration)}
                  </li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex gap-4 items-center">
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
                  <p className="text-sm text-muted-foreground">
                    This user is following you 🤗
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
};
