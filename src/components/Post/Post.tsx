import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { likePost, dislikePost } from '@/lib/api/posts';
import { timeUntil } from '@/lib/helpers/timeCompute';
import { IconButton } from '../IconButton/IconButton';
import { PostType, UserType } from '@/lib/types';
import { Avatar } from 'files-ui-react-19';
import { ShareModal } from '../ShareModal/ShareModal';

type PropsType = {
  post: PostType;
};

export const Post = ({ post }: PropsType) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutateAsync: likePostMutation, isPending: isLikePending } =
    useMutation({
      mutationFn: likePost,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['post', post._id] });
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      }
    });

  const { mutateAsync: dislikePostMutation, isPending: isDislikePending } =
    useMutation({
      mutationFn: dislikePost,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['post', post._id] });
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      }
    });

  const handleLikePost = async () => {
    try {
      await likePostMutation(post._id);
    } catch (error) {
      console.error(`Failed to like post ${post._id}:`, error);
    }
  };

  const handleDislikePost = async () => {
    try {
      await dislikePostMutation(post._id);
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

  const me: UserType = JSON.parse(localStorage.getItem('me') || '{}');

  return (
    <>
      <div
        className="flex items-start gap-3 p-4 bg-card rounded-lg shadow-sm cursor-pointer"
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
            {post.text}
          </p>
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
        <IconButton
          icon="clock-outline"
          number={timeUntil(post.expiresAt)}
          onClick={() => console.log('clicked on clock')}
        />
        <IconButton
          icon="heart-outline"
          number={post.likes.length}
          color={post.likes.includes(me._id) ? 'red' : 'grey'}
          onClick={handleLikePost}
          isPressed={isLikePending}
        />
        <IconButton
          icon="heart-off-outline"
          number={post.dislikes.length}
          color={post.dislikes.includes(me._id) ? 'red' : 'grey'}
          onClick={handleDislikePost}
          isPressed={isDislikePending}
        />
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
