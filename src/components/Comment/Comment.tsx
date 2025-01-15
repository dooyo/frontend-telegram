import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { likeComment, dislikeComment } from '@/lib/api/posts';
import { CommentType, UserType } from '@/lib/types';
import { timeUntil } from '@/lib/helpers/timeCompute';
import { IconButton } from '@/components/IconButton/IconButton';
import { Avatar } from 'files-ui-react-19';

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
        queryClient.invalidateQueries({ queryKey: ['comments', comment.post] });
      }
    });

  const { mutateAsync: dislikeCommentMutate, isPending: isDislikePending } =
    useMutation({
      mutationFn: dislikeComment,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['post', comment.post] });
        queryClient.invalidateQueries({ queryKey: ['comments', comment.post] });
      }
    });

  const handleLikeComment = async () => {
    try {
      await likeCommentMutate(comment._id as any);
    } catch (error) {
      console.error(`Failed to like comment ${comment._id}:`, error);
    }
  };

  const handleDislikeComment = async () => {
    try {
      await dislikeCommentMutate(comment._id as any);
    } catch (error) {
      console.error(`Failed to dislike comment ${comment._id}:`, error);
    }
  };

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/profile/' + comment.user._id);
  };

  const me: UserType = JSON.parse(localStorage.getItem('me') || '{}');

  return (
    <div className="flex items-start gap-3 p-4 border-b border-border">
      <Avatar
        src={
          comment.user.avatarUrl
            ? comment.user.avatarUrl.replace('localhost', '10.100.102.18')
            : 'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png'
        }
        alt={`${comment.user.username}'s avatar`}
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
        onClick={handleUserClick}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <button
              className="text-foreground font-semibold hover:underline text-left"
              onClick={handleUserClick}
            >
              {comment.user.username}
            </button>
            <button
              className="text-muted-foreground text-sm hover:underline text-left"
              onClick={handleUserClick}
            >
              @{comment.user.username}
            </button>
          </div>
          <button
            className="text-muted-foreground hover:text-foreground transition-colors px-2"
            onClick={(e) => {
              e.stopPropagation();
              console.log('clicked on dots');
            }}
          >
            •••
          </button>
        </div>
        <p className="mt-2 text-foreground break-words whitespace-pre-wrap">
          {comment.text}
        </p>
        <div className="flex items-center justify-between mt-4 px-2">
          <IconButton
            icon="clock-outline"
            number={timeUntil(comment.expiresAt)}
          />
          <IconButton
            icon="heart-outline"
            number={comment.likes.length}
            color={comment.likes.includes(me._id) ? 'red' : 'grey'}
            onClick={handleLikeComment}
            isPressed={isLikePending}
          />
          <IconButton
            icon="heart-off-outline"
            number={comment.dislikes.length}
            color={comment.dislikes.includes(me._id) ? 'red' : 'grey'}
            onClick={handleDislikeComment}
            isPressed={isDislikePending}
          />
          <IconButton icon="share-outline" onClick={() => {}} />
        </div>
      </div>
    </div>
  );
};
