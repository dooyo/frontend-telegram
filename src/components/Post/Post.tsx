import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { likePost, dislikePost, deletePost } from '@/lib/api/posts';
import { IconButton } from '@/components/IconButton/IconButton';
import { PostType, UserType, MediaFileType } from '@/lib/types';
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
import { MediaCarousel } from '../MediaCarousel/MediaCarousel';
import { Skeleton } from '@/components/ui/skeleton';

type PropsType = {
  post: PostType;
};

export const Post = ({ post }: PropsType) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [isLoadingMedia, setIsLoadingMedia] = useState(true);
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

  // Set loading to false after a short delay to allow images to load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingMedia(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

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

  const hasMediaFiles =
    post.mediaFiles &&
    Array.isArray(post.mediaFiles) &&
    post.mediaFiles.length > 0;

  return (
    <div
      className="glass-card p-4 mb-4 rounded-lg cursor-pointer"
      onClick={handlePostClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2" onClick={handleUserClick}>
          <Avatar
            src={post.user.avatarUrl?.replace('localhost', '10.100.102.18')}
            alt={post.user.username}
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
          <div>
            <div className="font-medium">{post.user.username}</div>
            <div className="text-xs text-muted-foreground">
              {new Date(post.createdAt).toLocaleString()}
            </div>
          </div>
        </div>

        <DropdownMenu>
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
            {!isMyPost && (
              <DropdownMenuItem onClick={handleReport}>
                <Flag className="w-4 h-4 mr-2" />
                Report
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mb-4">
        <ContentText text={post.text} />
      </div>

      {/* Display media carousel if post has media files */}
      {hasMediaFiles && !isLoadingMedia && (
        <div className="mb-4" onClick={(e) => e.stopPropagation()}>
          <MediaCarousel mediaFiles={post.mediaFiles as MediaFileType[]} />
        </div>
      )}

      {/* Show loading state while media is loading */}
      {hasMediaFiles && isLoadingMedia && (
        <div className="mb-4">
          <Skeleton className="w-full h-[300px] rounded-lg" />
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div
            className="flex items-center gap-1 cursor-pointer"
            onClick={handleLikePost}
            ref={likeButtonRef}
          >
            <IconButton
              icon="heart-outline"
              color={
                post.likes.includes(me._id)
                  ? 'var(--color-icon-active)'
                  : 'var(--color-icon-default)'
              }
              isPressed={isLikePending}
            />
            <span className="text-sm">{post.likes.length}</span>
          </div>
          <div
            className="flex items-center gap-1 cursor-pointer"
            onClick={handleDislikePost}
            ref={dislikeButtonRef}
          >
            <IconButton
              icon="heart-off-outline"
              color={
                post.dislikes.includes(me._id)
                  ? 'var(--color-icon-active)'
                  : 'var(--color-icon-default)'
              }
              isPressed={isDislikePending}
            />
            <span className="text-sm">{post.dislikes.length}</span>
          </div>
          <div
            className="flex items-center gap-1 cursor-pointer"
            onClick={handleCommentClick}
          >
            <IconButton icon="comment-outline" />
            <span className="text-sm">{post.commentCount}</span>
          </div>
          <div
            className="flex items-center gap-1 cursor-pointer"
            onClick={handleShareClick}
          >
            <IconButton icon="share-outline" />
          </div>
        </div>
        <div className="flex items-center gap-1" ref={clockButtonRef}>
          <IconButton icon="clock-outline" color={timeChangeColor} />
          <motion.span className="text-sm" style={{ color: timeChangeColor }}>
            {currentTime}
          </motion.span>
        </div>
      </div>
      {showShareModal && (
        <ShareModal
          postId={post._id}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};
