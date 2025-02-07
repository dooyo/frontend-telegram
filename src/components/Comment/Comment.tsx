import React, { useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { likeComment, dislikeComment, deleteComment } from '@/lib/api/posts';
import { CommentType, UserType } from '@/lib/types';
import { IconButton } from '@/components/IconButton/IconButton';
import { Avatar } from 'files-ui-react-19';
import { useLimits } from '@/context/LimitsContext';
import { motion } from 'framer-motion';
import { useTimeAnimation } from '@/hooks/useTimeAnimation';
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
  const clockButtonRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { refreshLimits } = useLimits();

  const {
    currentTime,
    timeChangeColor,
    handleTimeIncrease,
    handleTimeDecrease
  } = useTimeAnimation({ expiresAt: comment.expiresAt });

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
      refreshLimits();
    }
  });

  const handleLikeComment = async () => {
    try {
      if (!hasReacted) {
        handleTimeIncrease();
      }
      await likeCommentMutate(comment._id as any);
    } catch (error) {
      console.error(`Failed to like comment ${comment._id}:`, error);
    }
  };

  const handleDislikeComment = async () => {
    try {
      if (!hasReacted) {
        handleTimeDecrease();
      }
      await dislikeCommentMutate(comment._id as any);
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
                color={timeChangeColor}
                number={
                  <motion.div
                    style={{ color: timeChangeColor }}
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.3 }}
                  >
                    {currentTime}
                  </motion.div>
                }
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
    </>
  );
};
