import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { likePost, dislikePost, deletePost } from '@/lib/api/posts';
import { IconButton } from '@/components/IconButton/IconButton';
import { PostType, UserType } from '@/lib/types';
import { Avatar } from 'files-ui-react-19';
import { ShareModal } from '@/components/ShareModal/ShareModal';
import { useLimits } from '@/context/LimitsContext';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { Flag, Trash2 } from 'lucide-react';
import { ContentText } from '../ContentText/ContentText';
import { useTimeAnimation } from '@/hooks/useTimeAnimation';

type PropsType = {
  post: PostType;
};

export const Post = ({ post }: PropsType) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const likeButtonRef = useRef<HTMLDivElement>(null);
  const dislikeButtonRef = useRef<HTMLDivElement>(null);
  const clockButtonRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { refreshLimits } = useLimits();

  const {
    currentTime,
    timeChangeColor,
    handleTimeIncrease,
    handleTimeDecrease
  } = useTimeAnimation({ expiresAt: post.expiresAt });

  const me: UserType = JSON.parse(localStorage.getItem('me') || '{}');
  const hasReacted = post.reactions.includes(me._id);
  const isMyPost = post.user._id === me._id;

  const { mutateAsync: likePostMutate, isPending: isLikePending } = useMutation(
    {
      mutationFn: likePost,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['post', post._id] });
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      }
    }
  );

  const { mutateAsync: dislikePostMutate, isPending: isDislikePending } =
    useMutation({
      mutationFn: dislikePost,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['post', post._id] });
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      }
    });

  const { mutateAsync: deletePostMutation } = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      refreshLimits();
      navigate('/');
    }
  });

  const handleLikePost = async (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (!hasReacted) {
        handleTimeIncrease();
      }
      await likePostMutate(post._id as any);
    } catch (error) {
      console.error(`Failed to like post ${post._id}:`, error);
    }
  };

  const handleDislikePost = async (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (!hasReacted) {
        handleTimeDecrease();
      }
      await dislikePostMutate(post._id as any);
    } catch (error) {
      console.error(`Failed to dislike post ${post._id}:`, error);
    }
  };

  const handlePostClick = () => {
    navigate(`/post/${post._id}`);
  };

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile/${post.user._id}`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePostMutation(post._id);
      } catch (error) {
        console.error('Failed to delete post:', error);
      }
    }
  };

  const handleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement report functionality
    alert('Report functionality coming soon!');
  };

  const handleCommentClick = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/post/${post._id}`);
  };

  const handleShareClick = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    setShowShareModal(true);
  };

  return (
    <>
      <div
        className="glass-card p-4 transition-transform duration-200 hover:scale-[1.02] cursor-pointer"
        onClick={handlePostClick}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar
              src={post.user.avatarUrl?.replace('localhost', '10.100.102.18')}
              alt={`${post.user.username}'s avatar`}
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#DFDAD6',
                border: '1px solid #CBC3BE',
                borderRadius: '50%'
              }}
              variant="circle"
              readOnly
              onClick={handleUserClick}
            />
            <div className="flex flex-col">
              <span
                className="font-medium text-foreground"
                onClick={handleUserClick}
              >
                @{post.user.username}
              </span>
            </div>
          </div>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                className="text-[var(--color-icon-default)] hover:text-[var(--color-icon-hover)] transition-colors px-2"
                onClick={(e) => e.stopPropagation()}
              >
                •••
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isMyPost && (
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

        <div className="mt-3 text-foreground">
          <ContentText
            text={post.text}
            className="leading-relaxed"
            onPostClick={handlePostClick}
          />
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/10">
          <div className="flex items-center gap-6">
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
            <div ref={likeButtonRef}>
              <IconButton
                icon="heart-outline"
                number={post.likes.length}
                color={
                  post.likes.includes(me._id)
                    ? 'var(--color-icon-active)'
                    : 'var(--color-icon-default)'
                }
                onClick={handleLikePost}
                isPressed={isLikePending}
              />
            </div>
            <div ref={dislikeButtonRef}>
              <IconButton
                icon="heart-off-outline"
                number={post.dislikes.length}
                color={
                  post.dislikes.includes(me._id)
                    ? 'var(--color-icon-active)'
                    : 'var(--color-icon-default)'
                }
                onClick={handleDislikePost}
                isPressed={isDislikePending}
              />
            </div>
            <IconButton
              icon="comment-outline"
              number={post.commentCount}
              onClick={handleCommentClick}
              color="var(--color-icon-default)"
            />
          </div>
          <IconButton
            icon="share-outline"
            onClick={handleShareClick}
            color="var(--color-icon-default)"
          />
        </div>
      </div>
      {showShareModal && (
        <ShareModal
          postId={post._id}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </>
  );
};
