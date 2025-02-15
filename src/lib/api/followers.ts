import { API_URL } from './config';
import { Following } from '../types';
import { getAuthToken } from './auth';
import { PaginatedResponse } from './types';

const isMeFollowingUser = async (userId: string): Promise<boolean> => {
  const authToken = await getAuthToken();
  if (!authToken) {
    return false;
  }

  const response = await fetch(`${API_URL}/followers/${userId}/me`, {
    method: 'GET',
    headers: {
      Authorization: authToken,
      'Content-Type': 'application/json'
    }
  });
  if (response.status !== 200) {
    throw new Error('Failed to fetch posts');
  }
  return response.json();
};

const isUserFollowingMe = async (userId: string): Promise<boolean> => {
  const authToken = await getAuthToken();
  if (!authToken) {
    return false;
  }

  const response = await fetch(`${API_URL}/following/${userId}/me`, {
    method: 'GET',
    headers: {
      Authorization: authToken,
      'Content-Type': 'application/json'
    }
  });
  if (response.status !== 200) {
    throw new Error('Failed to fetch posts');
  }
  return response.json();
};

interface GetFollowersParams {
  cursor?: string;
  limit?: number;
}

const getMyFollowers = async (
  params?: GetFollowersParams
): Promise<PaginatedResponse<Following>> => {
  const authToken = await getAuthToken();
  if (!authToken) {
    return { data: [], total: 0, hasMore: false };
  }

  const searchParams = new URLSearchParams();
  if (params?.cursor) searchParams.append('cursor', params.cursor);
  if (params?.limit) searchParams.append('limit', params.limit.toString());

  const response = await fetch(
    `${API_URL}/followers${
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
    throw new Error('Failed to fetch followers');
  }
  return response.json();
};

const getFollowers = async (
  userId: string,
  params?: GetFollowersParams
): Promise<PaginatedResponse<Following>> => {
  const authToken = await getAuthToken();
  if (!authToken) {
    return { data: [], total: 0, hasMore: false };
  }

  const searchParams = new URLSearchParams();
  if (params?.cursor) searchParams.append('cursor', params.cursor);
  if (params?.limit) searchParams.append('limit', params.limit.toString());

  const response = await fetch(
    `${API_URL}/followers/${userId}${
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
    throw new Error('Failed to fetch followers');
  }
  return response.json();
};

const getMyFollowings = async (
  params?: GetFollowersParams
): Promise<PaginatedResponse<Following>> => {
  const authToken = await getAuthToken();
  if (!authToken) {
    return { data: [], total: 0, hasMore: false };
  }

  const searchParams = new URLSearchParams();
  if (params?.cursor) searchParams.append('cursor', params.cursor);
  if (params?.limit) searchParams.append('limit', params.limit.toString());

  const response = await fetch(
    `${API_URL}/following${
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
    throw new Error('Failed to fetch followings');
  }
  return response.json();
};

const getFollowings = async (
  userId: string,
  params?: GetFollowersParams
): Promise<PaginatedResponse<Following>> => {
  const authToken = await getAuthToken();
  if (!authToken) {
    return { data: [], total: 0, hasMore: false };
  }

  const searchParams = new URLSearchParams();
  if (params?.cursor) searchParams.append('cursor', params.cursor);
  if (params?.limit) searchParams.append('limit', params.limit.toString());

  const response = await fetch(
    `${API_URL}/following/${userId}${
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
    throw new Error('Failed to fetch followings');
  }
  return response.json();
};

const postFollow = async (userId: string) => {
  const authToken = await getAuthToken();
  if (!authToken) {
    return;
  }
  const response = await fetch(`${API_URL}/follow/${userId}`, {
    method: 'POST',
    headers: {
      Authorization: authToken,
      'Content-Type': 'application/json'
    }
  });

  if (response.status !== 201) {
    throw new Error('Failed to follow user');
  }
};

export {
  getMyFollowers,
  getMyFollowings,
  getFollowers,
  getFollowings,
  postFollow,
  isMeFollowingUser,
  isUserFollowingMe
};
