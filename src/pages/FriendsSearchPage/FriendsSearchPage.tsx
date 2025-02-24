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
      const response = await getProfilesSearch(searchTerm || '');
      setSearchResults(response as UserType[]);
    };

    fetchData();
  }, [searchTerm]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const renderUser = (item: UserType) => (
    <div
      key={item._id}
      className="glass-card p-4 transition-all duration-200 hover:scale-[1.02] cursor-pointer"
      onClick={() => navigate('/profile/' + item._id)}
    >
      <div className="flex items-center gap-3">
        <Avatar
          src={item.avatarUrl?.replace('localhost', '10.100.102.18')}
          alt={`${item.username}'s avatar`}
          style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#DFDAD6',
            border: '1px solid #CBC3BE',
            borderRadius: '50%'
          }}
          variant="circle"
          readOnly
        />
        <div className="flex flex-col flex-1">
          <span className="font-medium text-foreground">{item.username}</span>
          <span className="text-sm text-muted-foreground">
            @{item.username}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Container>
        <div className="space-y-4 p-4">
          <div className="sticky top-0 glass-card rounded-2xl p-2 z-10">
            <Input
              type="text"
              placeholder="Search users"
              value={searchTerm}
              onChange={handleSearchChange}
              onReset={() => setSearchTerm('')}
              containerClassName="bg-transparent"
              inputClassName="text-sm font-medium"
            />
          </div>

          <div className="space-y-2">
            {searchResults.length === 0 && searchTerm.length > 2 ? (
              <div className="text-center py-8 text-muted-foreground glass-card rounded-lg">
                No users found
              </div>
            ) : (
              searchResults.map((item) => renderUser(item))
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};
