import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { UserType } from '@/lib/types';
import { getMe, getProfileById, getProfileStatsById } from '@/lib/api/profiles';
import { getPosts } from '@/lib/api/posts';
import { getUserComments } from '@/lib/api/comments';
import { getTotalRewards, getRewardsHistory } from '@/lib/api/rewards';
import { calculateTotalLiveRewards } from '@/lib/helpers/rewardCalculator';
import {
  postFollow,
  isMeFollowingUser,
  isUserFollowingMe
} from '@/lib/api/followers';
import { timeDurationCalculator, timeUntil } from '@/lib/helpers/timeCompute';
import { Button } from '@/components/Button/Button';
import { Avatar } from 'files-ui-react-19';
import { useNavigate, useParams } from 'react-router-dom';
import { Container } from '@/components/ui/container';
import { ShareModal } from '@/components/ShareModal/ShareModal';
import { Share, Clock, MessageSquare } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Post } from '@/components/Post/Post';
import { Comment } from '@/components/Comment/Comment';
import { LimitsDisplay } from '@/components/LimitsDisplay/LimitsDisplay';
import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';
import { useLimits } from '@/context/LimitsContext';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { removeAuthToken } = useAuth() as any;
  const { id: userId } = useParams<{ id: string }>();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isUserFollowing, setIsUserFollowing] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [liveRewards, setLiveRewards] = useState(0);

  const { data: me, isLoading: isLoadingMe } = useQuery<UserType>({
    queryKey: ['me'],
    queryFn: getMe
  });

  const { limits } = useLimits();

  const {
    data: userData,
    isLoading: isLoadingUser,
    error: userError,
    refetch
  } = useQuery<UserType>({
    queryKey: ['user', userId],
    queryFn: () => getProfileById(userId as string),
    enabled: !!userId && userId !== me?._id,
    retry: 2
  });

  const { data: userStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['userStats', userId],
    queryFn: () => getProfileStatsById(userId as string),
    enabled: !!userId && userId !== me?._id,
    retry: 2
  });

  const { data: userPosts, isLoading: isLoadingPosts } = useQuery({
    queryKey: ['userPosts', userId],
    queryFn: () => getPosts({ userIds: [userId as string], limit: 5 }),
    enabled: !!userId
  });

  const { data: userComments, isLoading: isLoadingComments } = useQuery({
    queryKey: ['userComments', userId],
    queryFn: () => getUserComments(userId as string, { limit: 5 }),
    enabled: !!userId
  });

  const { data: totalRewards } = useQuery({
    queryKey: ['totalRewards', userId],
    queryFn: () => getTotalRewards(userId as string),
    enabled: !!userId && isCurrentUser
  });

  const { data: rewardsHistory, isLoading: isLoadingRewardsHistory } = useQuery(
    {
      queryKey: ['rewardsHistory', userId],
      queryFn: () => getRewardsHistory(userId as string),
      enabled: !!userId && isCurrentUser
    }
  );

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
      const isSelf = me._id === userId;
      setIsCurrentUser(isSelf);
    }
  }, [me, userId]);

  useEffect(() => {
    const fetchFollowersStatus = async () => {
      if (userId && me && userId !== me._id) {
        try {
          const [iFollow, userFollowsMe] = await Promise.all([
            isMeFollowingUser(userId),
            isUserFollowingMe(userId)
          ]);
          setIsFollowing(iFollow);
          setIsUserFollowing(userFollowsMe);
        } catch (error) {
          console.error('Error fetching follow status:', error);
        }
      }
    };

    fetchFollowersStatus();
  }, [me, userId]);

  // Update live rewards every second
  useEffect(() => {
    if (!isCurrentUser || !userPosts?.data || !userComments?.data) return;

    const activePosts = userPosts.data.filter(
      (post) => !post.expiresAt || new Date(post.expiresAt) > new Date()
    );
    const activeComments = userComments.data.filter(
      (comment) =>
        !comment.expiresAt || new Date(comment.expiresAt) > new Date()
    );

    const calculateAndUpdateLiveRewards = () => {
      const total = calculateTotalLiveRewards(activePosts, activeComments);
      setLiveRewards(total);
    };

    calculateAndUpdateLiveRewards();
    const interval = setInterval(calculateAndUpdateLiveRewards, 1000);

    return () => clearInterval(interval);
  }, [isCurrentUser, userPosts?.data, userComments?.data]);

  const displayData = isCurrentUser ? me : userData;
  const isLoading = isLoadingMe || (isLoadingUser && !isCurrentUser);

  if (isLoading) {
    return (
      <Container>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Container>
    );
  }

  if (!displayData || userError) {
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
    <div className="min-h-screen bg-gradient-to-br from-dooyo-lavender via-dooyo-peach to-dooyo-rose">
      <Container className="px-4 pb-20">
        <div className="flex flex-col md:flex-row items-start gap-8 pt-4">
          <div className="shrink-0 w-full md:w-auto">
            {displayData?.avatarUrl ? (
              <Avatar
                src={displayData.avatarUrl.replace(
                  'localhost',
                  '10.100.102.18'
                )}
                alt={`${displayData.username}'s avatar`}
                style={{
                  width: '8rem',
                  height: '8rem',
                  backgroundColor: '#DFDAD6',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  backdropFilter: 'blur(2px)',
                  background: 'rgba(255, 255, 255, 0.1)'
                }}
                variant="circle"
                readOnly
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <span className="text-4xl text-[var(--color-icon-default)]">
                  {displayData?.username?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
            )}
          </div>
          <div className="w-full space-y-6 max-w-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold truncate">
                    {displayData?.username}
                  </h1>
                  {userData?.isPremium && (
                    <Badge variant="secondary" className="gap-1">
                      <Crown className="h-3 w-3" />
                    </Badge>
                  )}
                </div>
                <Button
                  onClick={() => setShowShareModal(true)}
                  className="bg-primary hover:bg-primary/90 text-white shadow-lg transition-all duration-200 hover-scalee flex items-center gap-2 shrink-0"
                  disabled={false}
                >
                  <Share className="w-4 h-4" />
                  Share
                </Button>
              </div>
              <p className="text-sm text-[var(--color-icon-default)]">
                Expires in:{' '}
                {displayData?.expiresAt
                  ? timeUntil(displayData?.expiresAt)
                  : 'NEVER'}
              </p>
              {isCurrentUser && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="glass-card p-4 hover-scale">
                    <LimitsDisplay type="posts" showUpgradeButton={false} />
                  </div>
                  <div className="glass-card p-4 hover-scale">
                    <LimitsDisplay
                      type="comments"
                      showUpgradeButton={
                        limits?.comments.remaining === 0 ||
                        limits?.posts.remaining === 0
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            {!isLoadingStats && userStats && (
              <Accordion type="multiple" className="w-full space-y-4">
                {isCurrentUser && (
                  <AccordionItem value="rewards" className="glass-card">
                    <AccordionTrigger className="text-lg font-medium px-4 text-[var(--color-text)]">
                      <span>Rewards</span>
                      <div className="flex items-center gap-2 ml-auto mr-2">
                        <span className="text-sm text-[var(--color-icon-default)]">
                          {((totalRewards?.total || 0) + liveRewards).toFixed(
                            3
                          )}{' '}
                          TIME
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-[var(--color-text)]">
                              Currently Accumulating
                            </h3>
                            <span className="text-sm text-[var(--color-icon-default)]">
                              {liveRewards.toFixed(3)} TIME
                            </span>
                          </div>
                        </div>

                        <div className="border-t border-white/10 my-4"></div>

                        <h3 className="font-medium text-[var(--color-text)]">
                          Settled Rewards
                        </h3>
                        {isLoadingRewardsHistory ? (
                          <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-icon-default)]"></div>
                          </div>
                        ) : rewardsHistory?.rewards &&
                          rewardsHistory.rewards.length > 0 ? (
                          <div className="space-y-3">
                            {rewardsHistory.rewards.map((reward) => (
                              <div
                                key={reward._id}
                                className="flex items-center justify-between p-3 rounded-lg glass-card hover-scale"
                              >
                                <div className="flex items-center gap-2">
                                  {reward.type === 'POST_LIFETIME' ? (
                                    <Clock className="w-4 h-4 text-[var(--color-icon-default)]" />
                                  ) : (
                                    <MessageSquare className="w-4 h-4 text-[var(--color-icon-default)]" />
                                  )}
                                  <span className="text-sm font-medium text-[var(--color-text)]">
                                    {reward.amount.toFixed(3)} TIME
                                  </span>
                                  <span className="text-xs text-[var(--color-icon-default)]">
                                    {timeUntil(reward.contentExpiredAt)} ago
                                    from{' '}
                                    {reward.type === 'POST_LIFETIME'
                                      ? 'post'
                                      : 'comment'}{' '}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[var(--color-icon-default)] text-center py-4">
                            No settled rewards yet
                          </p>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                <AccordionItem value="live-posts" className="glass-card">
                  <AccordionTrigger className="text-lg font-medium px-4 text-[var(--color-text)]">
                    <span>Live Posts</span>
                    <div className="flex items-center gap-2 ml-auto mr-2">
                      <span className="text-sm text-[var(--color-icon-default)]">
                        ({userPosts?.data.length || 0})
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 p-4">
                      {isLoadingPosts ? (
                        <div className="flex justify-center py-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-icon-default)]"></div>
                        </div>
                      ) : userPosts?.data && userPosts.data.length > 0 ? (
                        userPosts.data.map((post) => (
                          <div key={post._id} className="hover-scale">
                            <Post post={post} />
                          </div>
                        ))
                      ) : (
                        <p className="text-[var(--color-icon-default)] text-center py-4">
                          No posts yet
                        </p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="live-comments" className="glass-card">
                  <AccordionTrigger className="text-lg font-medium px-4 text-[var(--color-text)]">
                    <span>Live Comments</span>
                    <div className="flex items-center gap-2 ml-auto mr-2">
                      <span className="text-sm text-[var(--color-icon-default)]">
                        ({userComments?.data.length || 0})
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 p-4">
                      {isLoadingComments ? (
                        <div className="flex justify-center py-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-icon-default)]"></div>
                        </div>
                      ) : userComments?.data && userComments.data.length > 0 ? (
                        userComments.data.map((comment) => (
                          <div
                            key={comment._id}
                            onClick={() =>
                              navigate(`/post/${(comment.post as any)._id}`)
                            }
                            className="hover-scale cursor-pointer"
                          >
                            <Comment comment={comment} />
                          </div>
                        ))
                      ) : (
                        <p className="text-[var(--color-icon-default)] text-center py-4">
                          No comments yet
                        </p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="stats" className="glass-card">
                  <AccordionTrigger className="text-lg font-medium px-4 text-[var(--color-text)]">
                    User Statistics
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                      <div className="space-y-2 rounded-lg p-4 glass-card hover-scale">
                        <h2 className="font-medium text-[var(--color-text)]">
                          Comments
                        </h2>
                        <ul className="space-y-1 text-sm text-[var(--color-icon-default)]">
                          <li>Total: {userStats.totalComments}</li>
                          <li>Likes: {userStats.totalCommentsLikes}</li>
                          <li>Dislikes: {userStats.totalCommentsDislikes}</li>
                          <li>
                            Duration:{' '}
                            {timeDurationCalculator(
                              userStats.totalCommentsDuration
                            )}
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-2 rounded-lg p-4 glass-card hover-scale">
                        <h2 className="font-medium text-[var(--color-text)]">
                          Posts
                        </h2>
                        <ul className="space-y-1 text-sm text-[var(--color-icon-default)]">
                          <li>Total: {userStats.totalPosts}</li>
                          <li>Likes: {userStats.totalPostsLikes}</li>
                          <li>Dislikes: {userStats.totalPostsDislikes}</li>
                          <li>
                            Duration:{' '}
                            {timeDurationCalculator(
                              userStats.totalPostsDuration
                            )}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}

            <div className="flex gap-4 items-center">
              {isCurrentUser ? (
                <Button
                  disabled={false}
                  onClick={handleLogout}
                  className="bg-primary hover:bg-primary/90 text-white shadow-lg transition-all duration-200 hover-scale"
                >
                  Logout
                </Button>
              ) : (
                <>
                  <Button
                    disabled={isFollowPending}
                    onClick={handleFollow}
                    className="bg-primary hover:bg-primary/90 text-white shadow-lg transition-all duration-200 hover-scale"
                  >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </Button>
                  {isUserFollowing && (
                    <p className="text-sm text-[var(--color-icon-default)]">
                      This user is following you 🤗
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        {showShareModal && (
          <ShareModal
            userId={userId}
            onClose={() => setShowShareModal(false)}
          />
        )}
      </Container>
    </div>
  );
};
