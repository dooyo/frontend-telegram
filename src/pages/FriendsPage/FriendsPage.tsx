import React, { useState, useEffect } from 'react';
import {
  getMyFollowers,
  getMyFollowings,
  postFollow
} from '@/lib/api/followers';
import { Following } from '@/lib/types';
import { Link, useNavigate } from 'react-router-dom';
import './FriendsPage.css';
import { Avatar } from '@files-ui/react';
import { Input } from '@/components/Input/Input';
import { Button } from '@/components/Button/Button';
import { MdAdd } from 'react-icons/md';

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
      setFollowings((prevFollowings) =>
        prevFollowings.filter((following) => following.user._id !== userId)
      );
    } catch (error) {
      console.error('Failed to unfollow user:', error);
    }
  };

  const renderUser = (item: Following) => (
    <div
      className="user-item"
      onClick={() =>
        navigate(
          `/profile/${tabIndex === 0 ? item.followerUser._id : item.user._id}`
        )
      }
    >
      <Avatar
        src={
          tabIndex === 0
            ? item.followerUser.avatarUrl?.replace('localhost', '10.100.102.18')
            : item.user.avatarUrl?.replace('localhost', '10.100.102.18')
        }
        alt="user avatar"
        style={{
          width: '50px',
          height: '50px',
          backgroundColor: '#DFDAD6',
          border: '1px',
          borderStyle: 'solid',
          borderColor: '#CBC3BE',
          marginRight: '10px'
        }}
        variant="circle"
        readOnly
      />
      <span className="username">
        @{tabIndex === 0 ? item.followerUser.username : item.user.username}
      </span>
      <div>
        {tabIndex === 1 && (
          <Button
            disabled={false}
            onClick={() => handleUnfollow(item.user._id)}
          >
            Unfollow
          </Button>
        )}
      </div>
    </div>
  );

  const filteredData = (tabIndex === 0 ? followers : followings).filter(
    (following) =>
      (tabIndex === 0
        ? following?.followerUser?.username
        : following?.user?.username
      )
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <Input
        type="text"
        placeholder={`Search my ${tabIndex === 0 ? 'followers' : 'followings'}`}
        onChange={(e) => setSearchQuery(e.target.value)}
        value={searchQuery}
      />
      <div className="tab-container">
        <div
          className={`tab ${tabIndex === 0 ? 'active-tab' : ''}`}
          onClick={() => setTabIndex(0)}
        >
          Followers
        </div>
        <div
          className={`tab ${tabIndex === 1 ? 'active-tab' : ''}`}
          onClick={() => setTabIndex(1)}
        >
          Following
        </div>
      </div>
      {loading ? (
        <div className="loader">Loading...</div>
      ) : (
        <div className="list">
          {filteredData.map((item) => renderUser(item))}
        </div>
      )}
      <Link to="/newPost" className="floating-button">
        <MdAdd className="feather-icon" />
      </Link>
    </div>
  );
};
