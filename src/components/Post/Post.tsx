import { type FC } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { likePost, dislikePost } from '@/lib/api/posts';
import { timeUntil } from '@/lib/helpers/timeCompute';
import { IconButton } from '../IconButton/IconButton';
import './Post.css';
import { PostType, UserType } from '@/lib/types';
import { Avatar } from '@files-ui/react';

export const Post: FC<{ post: PostType }> = ({ post }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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

  const me: UserType = JSON.parse(localStorage.getItem('me') || '{}');

  return (
    <div className="post">
      <div
        className="post__header"
        onClick={() => {
          navigate(`/post/${post._id}`);
        }}
      >
        <Avatar
          src={
            post.user.avatarUrl
              ? post.user.avatarUrl.replace('localhost', '10.100.102.18')
              : 'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png'
          }
          alt="user avatar"
          style={{
            width: '50px',
            height: '50px',
            backgroundColor: '#DFDAD6',
            border: '1px',
            borderStyle: 'solid',
            borderColor: '#CBC3BE',
            marginRight: '10px'
          }}
          variant="circle"
          readOnly
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/profile/${post.user._id}`);
          }}
        />
        <div className="post__user-info">
          <span
            className="post__username"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/profile/${post.user._id}`);
            }}
          >
            {post.user.username}
          </span>
          <span
            className="post__user-handle"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/profile/${post.user._id}`);
            }}
          >
            @{post.user.username}
          </span>
        </div>
        <i
          className="post__options"
          onClick={(e) => {
            e.stopPropagation();
            console.log('clicked on dots');
          }}
        >
          •••
        </i>
      </div>
      <p
        className="post__content"
        onClick={() => {
          navigate(`/post/${post._id}`);
        }}
      >
        {post.text}
      </p>
      {post.image && (
        <img src={post.image} alt="post content" className="post__image" />
      )}
      <div className="post__footer">
        <IconButton
          icon="comment-outline"
          number={post.comments.length}
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
        <IconButton icon="share-outline" />
      </div>
    </div>
  );
};
