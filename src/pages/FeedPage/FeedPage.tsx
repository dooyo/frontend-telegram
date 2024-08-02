import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPosts } from '@/lib/api/posts';
import { Post } from '@/components/Post/Post';
import { Link } from 'react-router-dom';
import './FeedPage.css';
import { PostType } from '@/lib/types';
import { type FC } from 'react';
import { MdAdd } from 'react-icons/md';

export const FeedPage: FC = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['posts'],
    queryFn: getPosts
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  if (isLoading && !isRefreshing) {
    return <div className="spinner">Loading...</div>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div className="page">
      <button onClick={onRefresh} disabled={isRefreshing}>
        {isRefreshing ? 'Refreshing...' : 'Refresh'}
      </button>
      <ul className="post-list">
        {data.map((post: PostType, index: number) => (
          <Post key={index} post={post} />
        ))}
      </ul>

      <Link to="/newPost" className="floating-button">
        <MdAdd className="feather-icon" />
      </Link>
    </div>
  );
};
