import React, { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { likeComment, dislikeComment, deleteComment } from '@/lib/api/posts';
import { CommentType, UserType } from '@/lib/types';
import { timeUntil } from '@/lib/helpers/timeCompute';
import { IconButton } from '@/components/IconButton/IconButton';
import { Avatar } from 'files-ui-react-19';
import { ClockFountain } from '@/components/ClockFountain/ClockFountain';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { Flag, Trash2 } from 'lucide-react';
import { ContentText } from '../ContentText/ContentText';

type PropsType = {
  comment: CommentType;
};

export const Comment: React.FC<PropsType> = ({ comment }) => {
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [showDislikeAnimation, setShowDislikeAnimation] = useState(false);
  const [animationPosition, setAnimationPosition] = useState({ x: 0, y: 0 });
  const clockButtonRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const me: UserType = JSON.parse(localStorage.getItem('me') || '{}');
  const hasReacted = comment.reactions.includes(me._id);
  const isMyComment = comment.user._id === me._id;

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

  const { mutateAsync: deleteCommentMutation } = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', comment.post] });
      queryClient.invalidateQueries({ queryKey: ['post', comment.post] });
    }
  });

  const handleLikeComment = async () => {
    try {
      if (!hasReacted) {
        const rect = clockButtonRef.current?.getBoundingClientRect();
        if (rect) {
          setAnimationPosition({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
          });
        }
        setShowLikeAnimation(true);
      }
      await likeCommentMutate(comment._id as any);
      if (!hasReacted) {
        setTimeout(() => setShowLikeAnimation(false), 1000);
      }
    } catch (error) {
      console.error(`Failed to like comment ${comment._id}:`, error);
    }
  };

  const handleDislikeComment = async () => {
    try {
      if (!hasReacted) {
        const rect = clockButtonRef.current?.getBoundingClientRect();
        if (rect) {
          setAnimationPosition({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
          });
        }
        setShowDislikeAnimation(true);
      }
      await dislikeCommentMutate(comment._id as any);
      if (!hasReacted) {
        setTimeout(() => setShowDislikeAnimation(false), 1000);
      }
    } catch (error) {
      console.error(`Failed to dislike comment ${comment._id}:`, error);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteCommentMutation(comment._id);
      } catch (error) {
        console.error('Failed to delete comment:', error);
      }
    }
  };

  const handleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement report functionality
    alert('Report functionality coming soon!');
  };

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/profile/' + comment.user._id);
  };

  return (
    <>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="text-muted-foreground hover:text-foreground transition-colors px-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  •••
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isMyComment && (
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={handleDelete}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleReport}>
                  <Flag className="w-4 h-4 mr-2" />
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <ContentText text={comment.text} className="mt-2 text-foreground" />
          <div className="flex items-center justify-between mt-4 px-2">
            <div ref={clockButtonRef}>
              <IconButton
                icon="clock-outline"
                number={timeUntil(comment.expiresAt)}
              />
            </div>
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
      {showLikeAnimation && !hasReacted && (
        <ClockFountain
          isLiked={true}
          x={animationPosition.x}
          y={animationPosition.y}
        />
      )}
      {showDislikeAnimation && !hasReacted && (
        <ClockFountain
          isLiked={false}
          x={animationPosition.x}
          y={animationPosition.y}
        />
      )}
    </>
  );
};
