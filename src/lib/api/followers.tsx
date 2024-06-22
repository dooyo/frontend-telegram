import axios from 'axios';
import { API_URL } from './config';
import { Following } from '../types';
import { getAuthToken } from './auth';

const isMeFollowingUser = async (userId: string): Promise<boolean> => {
  const authToken = await getAuthToken();
  if (!authToken) {
    return false;
  }

  try {
    const response = await axios.get(`${API_URL}/followers/${userId}/me`, {
      headers: {
        Cookie: authToken,
        'Content-Type': 'application/json'
      }
    });
    if (response.status !== 200) {
      throw new Error('Failed to fetch posts');
    }
    return response.data;
  } catch (error) {
    throw new Error(`Failed fetching posts: ${error}`);
  }
};

const isUserFollowingMe = async (userId: string): Promise<boolean> => {
  const authToken = await getAuthToken();
  if (!authToken) {
    return false;
  }

  try {
    const response = await axios.get(`${API_URL}/following/${userId}/me`, {
      headers: {
        Cookie: authToken,
        'Content-Type': 'application/json'
      }
    });
    if (response.status !== 200) {
      throw new Error('Failed to fetch posts');
    }
    return response.data;
  } catch (error) {
    throw new Error(`Failed fetching posts: ${error}`);
  }
};

const getMyFollowers = async (): Promise<Following[]> => {
  const authToken = await getAuthToken();
  if (!authToken) {
    return [] as Following[];
  }

  try {
    const response = await axios.get(`${API_URL}/followers`, {
      headers: {
        Cookie: authToken,
        'Content-Type': 'application/json'
      }
    });
    if (response.status !== 200) {
      throw new Error('Failed to fetch posts');
    }
    return response.data as Following[];
  } catch (error) {
    throw new Error(`Failed fetching posts: ${error}`);
  }
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

  try {
    const response = await axios.get(
      `${API_URL}/followers/${userId}?page=${page}&limit=${limit}`,
      {
        headers: {
          Cookie: authToken,
          'Content-Type': 'application/json'
        }
      }
    );
    if (response.status !== 200) {
      throw new Error('Failed to fetch posts');
    }
    return response.data;
  } catch (error) {
    throw new Error(`Failed fetching posts: ${error}`);
  }
};

const getMyFollowings = async (): Promise<Following[]> => {
  const authToken = await getAuthToken();
  if (!authToken) {
    return [];
  }

  try {
    const response = await axios.get(`${API_URL}/following`, {
      headers: {
        Cookie: authToken,
        'Content-Type': 'application/json'
      }
    });
    if (response.status !== 200) {
      throw new Error('Failed to fetch posts');
    }
    return response.data;
  } catch (error) {
    throw new Error(`Failed fetching posts: ${error}`);
  }
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

  try {
    const response = await axios.get(
      `${API_URL}/following/${userId}?page=${page}&limit=${limit}`,
      {
        headers: {
          Cookie: authToken,
          'Content-Type': 'application/json'
        }
      }
    );
    if (response.status !== 200) {
      throw new Error('Failed to fetch posts');
    }
    return response.data;
  } catch (error) {
    throw new Error(`Failed fetching posts: ${error}`);
  }
};

const postFollow = async (userId: string) => {
  const authToken = await getAuthToken();
  if (!authToken) {
    return;
  }
  const response = await fetch(`${API_URL}/follow/${userId}`, {
    method: 'POST',
    headers: {
      Cookie: authToken,
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
