import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createPost } from '@/lib/api/posts';
import { getMe } from '@/lib/api/profiles';
import { UserType } from '@/lib/types';
import './NewPostPage.css';

export const NewPostPage: React.FC = () => {
  const [text, setText] = useState('');
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });

  const { data, isLoading } = useQuery<UserType, boolean>({
    queryKey: ['me'],
    queryFn: getMe
  });

  if (isLoading) {
    return <div className="spinner">Loading...</div>;
  }

  const onPostPress = async () => {
    try {
      await mutateAsync({ text } as any);
      setText('');
      navigate(-1); // Go back to the previous page
    } catch (error) {
      console.log('Failed to post:', error);
    }
  };

  return (
    <div className="container">
      <div className="inputContainer">
        <img
          src={data?.avatarUrl?.replace('localhost', '10.100.102.18')}
          alt="User Avatar"
          className="userImage"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`What's on your mind, ${data?.username}?`}
          rows={10}
          className="textInput"
        />
      </div>
      <div className="buttonsContainer">
        {isPending && <span className="postingText">Posting...</span>}
        <button
          onClick={onPostPress}
          className="new-post-button"
          disabled={isPending}
        >
          Post
        </button>
      </div>
      {error && <div className="errorText">Error: {error.message}</div>}
    </div>
  );
};
