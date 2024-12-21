import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfilesSearch } from '@/lib/api/profiles';
import { UserType } from '@/lib/types';
import { Avatar } from 'files-ui-react-19';
import { Input } from '@/components/Input/Input';
import { Container } from '@/components/ui/container';

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
    <div
      key={item._id}
      className="flex items-center p-4 cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => navigate('/profile/' + item._id)}
    >
      <Avatar
        src={item.avatarUrl?.replace('localhost', '10.100.102.18')}
        alt={`${item.username}'s avatar`}
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
      <span className="flex-1 ml-2.5">@{item.username}</span>
    </div>
  );

  return (
    <Container>
      <div className="space-y-4">
        <div className="sticky top-0 bg-background pt-4 pb-2 z-10 border-b border-input-border">
          <Input
            type="text"
            placeholder="Search users"
            value={searchTerm}
            onChange={handleSearchChange}
            onReset={() => setSearchTerm('')}
          />
        </div>
        <div className="divide-y divide-input-border">
          {searchResults.length === 0 && searchTerm.length > 2 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found
            </div>
          ) : (
            searchResults.map((item) => renderUser(item))
          )}
        </div>
      </div>
    </Container>
  );
};
