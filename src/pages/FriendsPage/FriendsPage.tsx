import React, { useState, useEffect } from 'react';
import {
  getMyFollowers,
  getMyFollowings,
  postFollow
} from '@/lib/api/followers';
import { Following } from '@/lib/types';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar } from '@files-ui/react';
import { Input } from '@/components/Input/Input';
import { Button } from '@/components/Button/Button';
import { MdAdd } from 'react-icons/md';
import { Container } from '@/components/ui/container';

export const FriendsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tabIndex, setTabIndex] = useState(0);
  const [followers, setFollowers] = useState<Following[]>([]);
  const [followings, setFollowings] = useState<Following[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (tabIndex === 0) {
          const followersData = await getMyFollowers();
          setFollowers(followersData as Following[]);
        } else {
          const followingsData = await getMyFollowings();
          setFollowings(followingsData as Following[]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tabIndex]);

  const handleUnfollow = async (userId: string) => {
    try {
      await postFollow(userId);
      const followingsData = await getMyFollowings();
      setFollowings(followingsData as Following[]);
    } catch (error) {
      console.error('Failed to unfollow user:', error);
    }
  };

  const renderUser = (item: Following) => {
    const user = tabIndex === 0 ? item.followerUser : item.user;
    const isDeletedUser = !user || !user.username;

    return (
      <div
        key={user?._id || item._id}
        className="flex items-center p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => {
          if (!isDeletedUser) {
            navigate(`/profile/${user._id}`);
          }
        }}
        style={{ cursor: isDeletedUser ? 'default' : 'pointer' }}
      >
        <Avatar
          src={user?.avatarUrl?.replace('localhost', '10.100.102.18')}
          alt={user?.username || 'Deleted User'}
          style={{
            width: '50px',
            height: '50px',
            backgroundColor: '#DFDAD6',
            border: '1px',
            borderStyle: 'solid',
            borderColor: '#CBC3BE'
          }}
          variant="circle"
          readOnly
        />
        <span className="flex-1 ml-2.5">
          {isDeletedUser ? 'Deleted User' : `@${user.username}`}
        </span>
        {tabIndex === 1 && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleUnfollow(user._id);
            }}
            disabled={false}
            className="text-sm"
          >
            Unfollow
          </Button>
        )}
      </div>
    );
  };

  const filteredData = (tabIndex === 0 ? followers : followings).filter(
    (following) => {
      const username =
        tabIndex === 0
          ? following?.followerUser?.username
          : following?.user?.username;

      if (!username) return false; // Don't filter deleted users if search is empty
      if (!searchQuery) return true;

      return username.toLowerCase().includes(searchQuery.toLowerCase());
    }
  );

  return (
    <Container>
      <div className="space-y-4">
        <div className="sticky top-0 bg-background pt-4 pb-2 space-y-4 z-10 border-b border-input-border">
          <Input
            type="text"
            placeholder={`Search my ${
              tabIndex === 0 ? 'followers' : 'followings'
            }`}
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery}
            onReset={() => setSearchQuery('')}
          />
          <div className="flex">
            <div
              className={`flex-1 text-center py-2 cursor-pointer border-b-2 ${
                tabIndex === 0 ? 'border-primary' : 'border-transparent'
              }`}
              onClick={() => setTabIndex(0)}
            >
              Followers
            </div>
            <div
              className={`flex-1 text-center py-2 cursor-pointer border-b-2 ${
                tabIndex === 1 ? 'border-primary' : 'border-transparent'
              }`}
              onClick={() => setTabIndex(1)}
            >
              Following
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div>
            {filteredData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No {tabIndex === 0 ? 'followers' : 'following'} found
              </div>
            ) : (
              <div className="divide-y divide-input-border">
                {filteredData.map((item) => renderUser(item))}
              </div>
            )}
          </div>
        )}
      </div>

      <Link
        to="/friendsSearch"
        className="fixed bottom-20 right-4 sm:right-8 z-50 rounded-full w-14 h-14 bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
      >
        <MdAdd className="w-6 h-6" />
        <span className="sr-only">Add friends</span>
      </Link>
    </Container>
  );
};
