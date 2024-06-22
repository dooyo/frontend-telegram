import axios from 'axios';
import { API_URL } from './config';
import { UserType } from '@/lib/types';
import { getAuthToken } from './auth';

const getMe = async () => {
  const authToken = await getAuthToken();
  if (!authToken) {
    return {} as UserType;
  }

  try {
    const response = await axios.get(`${API_URL}/profiles/me`, {
      headers: {
        Cookie: authToken,
        'Content-Type': 'application/json'
      }
    });
    if (response.status !== 200) {
      throw new Error('Failed to fetch posts');
    }
    return response.data as UserType;
  } catch (error) {
    throw new Error(`Failed fetching posts: ${error}`);
  }
};

const getProfileById = async (userId: string) => {
  try {
    const response = await axios.get(`${API_URL}/profiles?_id=${userId}`);
    if (response.status !== 200) {
      throw new Error('Failed to fetch profile');
    }
    return response.data as UserType;
  } catch (error) {
    throw new Error(`Failed fetching profile: ${error}`);
  }
};

const getProfilesSearch = async (
  username: string,
  limit?: number,
  skip?: number
): Promise<UserType[]> => {
  try {
    const response = await axios.get(
      `${API_URL}/profiles/search?username=${username}`
    );
    if (response.status !== 200) {
      throw new Error('Failed to search profiles');
    }
    return response.data;
  } catch (error) {
    throw new Error(`Failed fetching profile: ${error}`);
  }
};

export { getMe, getProfileById, getProfilesSearch };
