import { API_URL } from './config';
import { UserType } from '@/lib/types';
import { getAuthToken } from './auth';

const getMe = async (): Promise<UserType> => {
  const authToken = await getAuthToken();
  if (!authToken) {
    return {} as UserType;
  }

  try {
    const response = await fetch(`${API_URL}/profiles/me`, {
      headers: {
        Authorization: authToken,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    const data = await response.json();
    return data as UserType;
  } catch (error) {
    throw new Error(`Failed fetching posts: ${error}`);
  }
};

const getProfileById = async (userId: string): Promise<UserType> => {
  try {
    const response = await fetch(`${API_URL}/profiles?_id=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }
    const data = await response.json();
    return data as UserType;
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
    const response = await fetch(
      `${API_URL}/profiles/search?username=${username}`
    );
    if (!response.ok) {
      throw new Error('Failed to search profiles');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Failed fetching profile: ${error}`);
  }
};

export { getMe, getProfileById, getProfilesSearch };
