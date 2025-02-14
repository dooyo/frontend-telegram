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

  const handleLikePost = async () => {
    try {
      if (!hasReacted) {
        handleTimeIncrease();
      }
      await likePostMutate(post._id as any);
    } catch (error) {
      console.error(`Failed to like post ${post._id}:`, error);
    }
  };

  const handleDislikePost = async () => {
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

  return (
    <>
      <div
        className="flex items-start gap-3 p-4 bg-card rounded-lg shadow-xs cursor-pointer"
        onClick={handlePostClick}
      >
        <Avatar
          src={
            post.user.avatarUrl
              ? post.user.avatarUrl.replace('localhost', '10.100.102.18')
              : 'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png'
          }
          alt={`${post.user.username}'s avatar`}
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
                {post.user.username}
              </button>
              <button
                className="text-muted-foreground text-sm hover:underline text-left"
                onClick={handleUserClick}
              >
                @{post.user.username}
              </button>
            </div>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  className="text-muted-foreground hover:text-foreground transition-colors px-2"
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
          <ContentText
            text={post.text}
            className="mt-2 text-foreground"
            onPostClick={handlePostClick}
          />
        </div>
      </div>
      <div
        className="flex items-center justify-between mt-4 px-2"
        onClick={(e) => e.stopPropagation()}
      >
        <IconButton
          icon="comment-outline"
          number={post.commentCount}
          onClick={() => navigate(`/post/${post._id}`)}
        />
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
            color={post.likes.includes(me._id) ? 'red' : 'grey'}
            onClick={handleLikePost}
            isPressed={isLikePending}
          />
        </div>
        <div ref={dislikeButtonRef}>
          <IconButton
            icon="heart-off-outline"
            number={post.dislikes.length}
            color={post.dislikes.includes(me._id) ? 'red' : 'grey'}
            onClick={handleDislikePost}
            isPressed={isDislikePending}
          />
        </div>
        <IconButton
          icon="share-outline"
          onClick={() => setShowShareModal(true)}
        />
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
