import { FC, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPosts } from '@/lib/api/posts';
import { Post } from '@/components/Post/Post';
import { Link } from 'react-router-dom';
import { PostType } from '@/lib/types';
import { PenSquare } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Container } from '@/components/ui/container';

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
    return (
      <Container className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <p className="text-destructive text-center mt-4">
          Error: {error.message}
        </p>
      </Container>
    );
  }

  return (
    <Container className="pb-20">
      <div className="flex flex-col items-center w-full">
        <Button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="mt-4 mb-4"
          variant="default"
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
        <ul className="w-full max-w-2xl space-y-4">
          {data?.map((post: PostType, index: number) => (
            <li key={index}>
              <Post post={post} />
            </li>
          ))}
        </ul>

        <Button
          asChild
          className="fixed bottom-20 right-4 sm:right-8 z-50 rounded-full w-14 h-14 p-0"
          size="icon"
        >
          <Link
            to="/newPost"
            className={buttonVariants({
              variant: 'default',
              size: 'icon',
              className:
                'fixed bottom-20 right-4 sm:right-8 z-50 rounded-full w-14 h-14 p-0'
            })}
          >
            <PenSquare className="w-6 h-6" />
            <span className="sr-only">Create new post</span>
          </Link>
        </Button>
      </div>
    </Container>
  );
};
