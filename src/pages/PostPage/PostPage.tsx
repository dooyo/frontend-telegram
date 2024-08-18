import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { getPost, postCommentOnPost } from '@/lib/api/posts';
import { Post } from '@/components/Post/Post';
import { Comment } from '@/components/Comment/Comment';
import { PostType } from '@/lib/types';
import './PostPage.css';
import { Button } from '@/components/Button/Button';
import { Input } from '@/components/Input/Input';

export const PostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [commentText, setCommentText] = useState('');
  const [isRefreshing, setRefreshing] = useState(false);

  const queryClient = useQueryClient();

  const { mutateAsync: postComment, isPending: isPending } = useMutation({
    mutationFn: (comment: string) =>
      postCommentOnPost(id as string, { text: comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      setCommentText('');
    }
  });

  const { data, isLoading, error, refetch } = useQuery<PostType, boolean>({
    queryKey: ['post', id],
    queryFn: () => getPost(id as string)
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  if (isLoading) {
    return <div className="spinner">Loading...</div>;
  }

  if (error) {
    return <div>Post not found</div>;
  }

  const handlePostComment = async () => {
    try {
      await postComment(commentText);
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  return (
    <div className="post-page">
      <div className="post-container">
        <Post post={data as PostType} />
      </div>
      <button onClick={onRefresh} disabled={isRefreshing}>
        {isRefreshing ? 'Refreshing...' : 'Refresh'}
      </button>
      <div className="comments-container">
        {data?.comments.length === 0 && (
          <div className="empty-comments">
            But it feels so empty without me...
          </div>
        )}
        <div className="comments-list">
          {data?.comments.map((comment, index) => (
            <Comment key={index} comment={comment} />
          ))}
        </div>
      </div>
      {isPending && <div className="commenting-text">Commenting...</div>}
      <div className="comment-input-container">
        <Input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write a comment..."
        />
        <Button onClick={handlePostComment} disabled={isPending}>
          Comment
        </Button>
      </div>
    </div>
  );
};
