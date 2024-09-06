import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfilesSearch } from '@/lib/api/profiles';
import { UserType } from '@/lib/types';
import './FriendsSearchPage.css';
import { Avatar } from '@files-ui/react';
import { Input } from '@/components/Input/Input';

export const FriendsSearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserType[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (searchTerm.length > 2) {
        const response = await getProfilesSearch(searchTerm);
        setSearchResults(response as UserType[]);
      } else {
        setSearchResults([]);
      }
    };

    fetchData();
  }, [searchTerm]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const renderUser = (item: UserType) => (
    <div className="user-item" onClick={() => navigate('/profile/' + item._id)}>
      <Avatar
        src={item.avatarUrl?.replace('localhost', '10.100.102.18')}
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
      <span className="username">@{item.username}</span>
    </div>
  );

  return (
    <div>
      <div className="search-bar-container">
        <Input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      <div className="list">
        {searchResults.map((item) => (
          <React.Fragment key={item._id}>{renderUser(item)}</React.Fragment>
        ))}
      </div>
    </div>
  );
};
