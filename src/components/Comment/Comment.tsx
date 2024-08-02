import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { likeComment, dislikeComment } from '@/lib/api/posts';
import { CommentType, UserType } from '@/lib/types';
import { timeUntil } from '@/lib/helpers/timeCompute';
import { IconButton } from '@/components/IconButton/IconButton';
import './Comment.css';

type PropsType = {
  comment: CommentType;
};

export const Comment: React.FC<PropsType> = ({ comment }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutateAsync: likeCommentMutate, isPending: isLikePending } =
    useMutation({
      mutationFn: likeComment,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['post', comment.post] });
      }
    });

  const { mutateAsync: dislikeCommentMutate, isPending: isDislikePending } =
    useMutation({
      mutationFn: dislikeComment,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['post', comment.post] });
      }
    });

  const onPressLikeComment = async () => {
    try {
      await likeCommentMutate(comment._id as any);
    } catch (error) {
      console.error(`Failed to like comment ${comment._id}:`, error);
    }
  };

  const onPressDislikeComment = async () => {
    try {
      await dislikeCommentMutate(comment._id as any);
    } catch (error) {
      console.error(`Failed to dislike comment ${comment._id}:`, error);
    }
  };

  const me: UserType = JSON.parse(localStorage.getItem('me') || '{}');

  return (
    <div className="comment-container">
      <div
        className="user-image-container"
        onClick={(e) => {
          e.stopPropagation();
          navigate('/profile/' + comment.user._id);
        }}
      >
        <img
          src={
            comment.user.avatarUrl
              ? comment.user.avatarUrl.replace('localhost', '10.100.102.18')
              : 'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png'
          }
          alt="User Avatar"
          className="user-image"
        />
      </div>
      <div className="main-container">
        <div className="header">
          <span
            className="user-name"
            onClick={(e) => {
              e.stopPropagation();
              navigate('/profile/' + comment.user._id);
            }}
          >
            {comment.user.username}
          </span>
          <span
            className="user-username"
            onClick={(e) => {
              e.stopPropagation();
              navigate('/profile/' + comment.user._id);
            }}
          >
            @{comment.user.username}
          </span>
          <span
            className="dots"
            onClick={(e) => {
              e.stopPropagation();
              console.log('clicked on dots');
            }}
          >
            ...
          </span>
        </div>
        <div className="comment-content">{comment.text}</div>
        <div className="footer">
          <IconButton
            icon="clock-outline"
            number={timeUntil(comment.expiresAt)}
          />
          <IconButton
            icon="heart-outline"
            number={comment.likes.length}
            color={comment.likes.includes(me._id) ? 'red' : 'grey'}
            onClick={onPressLikeComment}
            isPressed={isLikePending}
          />
          <IconButton
            icon="heart-off-outline"
            number={comment.dislikes.length}
            color={comment.dislikes.includes(me._id) ? 'red' : 'grey'}
            onClick={onPressDislikeComment}
            isPressed={isDislikePending}
          />
          <IconButton icon="share" />
        </div>
      </div>
    </div>
  );
};
