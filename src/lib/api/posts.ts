import { API_URL } from './config';
import { getAuthToken } from './auth';
import { PostType } from '@/lib/types';
import { GetPostsParams } from './types';

interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
  total: number;
  hasMore: boolean;
}

const getPosts = async (
  params?: GetPostsParams
): Promise<PaginatedResponse<PostType>> => {
  const authToken = await getAuthToken();
  if (!authToken) {
    return { data: [], total: 0, hasMore: false };
  }

  const searchParams = new URLSearchParams();
  if (params?.cursor) searchParams.append('cursor', params.cursor);
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.sortField) searchParams.append('sortField', params.sortField);
  if (params?.sortOrder)
    searchParams.append('sortOrder', params.sortOrder.toString());
  if (params?.userIds && params.userIds.length > 0) {
    searchParams.append('userIds', JSON.stringify(params.userIds));
  }

  const response = await fetch(
    `${API_URL}/posts${
      searchParams.toString() ? `?${searchParams.toString()}` : ''
    }`,
    {
      method: 'GET',
      headers: {
        Authorization: authToken,
        'Content-Type': 'application/json'
      }
    }
  );

  if (response.status !== 200) {
    throw new Error('Failed to fetch posts');
  }

  return response.json();
};

const getPost = async (id: string) => {
  const authToken = await getAuthToken();
  if (!authToken) {
    return {};
  }

  const response = await fetch(`${API_URL}/posts/${id}`, {
    method: 'GET',
    headers: {
      Authorization: authToken,
      'Content-Type': 'application/json'
    }
  });

  if (response.status === 404) {
    throw new Error('Post not found');
  }

  if (response.status !== 200) {
    throw new Error('Failed to fetch post');
  }

  return response.json();
};

const postCommentOnPost = async (
  id: string,
  data: { text: string; mentionedUserIds?: string[] }
) => {
  const authToken = await getAuthToken();
  if (!authToken) {
    return;
  }

  const response = await fetch(`${API_URL}/posts/${id}/comments`, {
    method: 'POST',
    headers: {
      Authorization: authToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (response.status === 401) {
    throw new Error('Unauthorized');
  }
  if (response.status !== 201) {
    throw new Error('Failed to create post');
  }
  return response.json();
};

const createPost = async (data: {
  text: string;
  mentionedUserIds?: string[];
}) => {
  const authToken = await getAuthToken();
  if (!authToken) {
    return;
  }

  const response = await fetch(`${API_URL}/posts`, {
    method: 'POST',
    headers: {
      Authorization: authToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (response.status === 401) {
    throw new Error('Unauthorized');
  }
  if (response.status !== 201) {
    throw new Error('Failed to create post');
  }
  return response.json();
};

const likePost = async (postId: string) => {
  const authToken = await getAuthToken();
  if (!authToken) {
    return;
  }
  const response = await fetch(`${API_URL}/likes/post/${postId}`, {
    method: 'POST',
    headers: {
      Authorization: authToken,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to like post');
  }

  return response.json();
};

const dislikePost = async (postId: string) => {
  const authToken = await getAuthToken();
  if (!authToken) {
    return;
  }
  const response = await fetch(`${API_URL}/dislikes/post/${postId}`, {
    method: 'POST',
    headers: {
      Authorization: authToken,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to dislike post');
  }

  return response.json();
};

// TODO: move to comments api ?
const likeComment = async (commentId: string) => {
  const authToken = await getAuthToken();
  if (!authToken) {
    return;
  }
  const response = await fetch(`${API_URL}/likes/comment/${commentId}`, {
    method: 'POST',
    headers: {
      Authorization: authToken,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to like comment');
  }

  return response.json();
};

const dislikeComment = async (commentId: string) => {
  const authToken = await getAuthToken();
  if (!authToken) {
    return;
  }
  const response = await fetch(`${API_URL}/dislikes/comment/${commentId}`, {
    method: 'POST',
    headers: {
      Authorization: authToken,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to dislike comment');
  }

  return response.json();
};

const deletePost = async (postId: string) => {
  const authToken = await getAuthToken();
  if (!authToken) {
    return;
  }
  const response = await fetch(`${API_URL}/posts/${postId}`, {
    method: 'DELETE',
    headers: {
      Authorization: authToken,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to delete post');
  }

  return response.json();
};

const deleteComment = async (commentId: string) => {
  const authToken = await getAuthToken();
  if (!authToken) {
    return;
  }
  const response = await fetch(`${API_URL}/comments/${commentId}`, {
    method: 'DELETE',
    headers: {
      Authorization: authToken,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to delete comment');
  }

  return response.json();
};

export {
  getPosts,
  getPost,
  createPost,
  postCommentOnPost,
  likePost,
  dislikePost,
  likeComment,
  dislikeComment,
  deletePost,
  deleteComment
};
