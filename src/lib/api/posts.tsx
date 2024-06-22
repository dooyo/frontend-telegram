import { API_URL } from './config';
import { getAuthToken } from './auth';

const getPosts = async () => {
  const response = await fetch(`${API_URL}/posts`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
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
      Cookie: authToken,
      'Content-Type': 'application/json'
    }
  });
  if (response.status !== 200) {
    throw new Error('Failed to fetch post');
  }
  return response.json();
};

const postCommentOnPost = async (id: string, data: { text: string }) => {
  const authToken = await getAuthToken();
  if (!authToken) {
    return;
  }

  const response = await fetch(`${API_URL}/posts/${id}/comments`, {
    method: 'POST',
    headers: {
      Cookie: authToken,
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

const createPost = async (data: { text: string }) => {
  const authToken = await getAuthToken();
  if (!authToken) {
    return;
  }

  const response = await fetch(`${API_URL}/posts`, {
    method: 'POST',
    headers: {
      Cookie: authToken,
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
      Cookie: authToken,
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
      Cookie: authToken,
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
      Cookie: authToken,
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
      Cookie: authToken,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to dislike comment');
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
  dislikeComment
};
