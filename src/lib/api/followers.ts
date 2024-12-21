import { API_URL } from './config';
import { Following } from '../types';
import { getAuthToken } from './auth';

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

const getMyFollowers = async (): Promise<Following[]> => {
  const authToken = await getAuthToken();
  if (!authToken) {
    return [] as Following[];
  }

  const response = await fetch(`${API_URL}/followers`, {
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

const getFollowers = async (
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<Following[]> => {
  const authToken = await getAuthToken();
  if (!authToken) {
    return [];
  }

  const response = await fetch(
    `${API_URL}/followers/${userId}?page=${page}&limit=${limit}`,
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

const getMyFollowings = async (): Promise<Following[]> => {
  const authToken = await getAuthToken();
  if (!authToken) {
    return [];
  }

  const response = await fetch(`${API_URL}/following`, {
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

const getFollowings = async (
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<Following[]> => {
  const authToken = await getAuthToken();
  if (!authToken) {
    return [];
  }

  const response = await fetch(
    `${API_URL}/following/${userId}?page=${page}&limit=${limit}`,
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
