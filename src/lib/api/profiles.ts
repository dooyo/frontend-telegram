import { API_URL } from './config';
import { UserStatsType, UserType } from '@/lib/types';
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

const getProfileStatsById = async (userId: string): Promise<UserStatsType> => {
  try {
    const response = await fetch(`${API_URL}/profiles/stats?_id=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch profile stats');
    }
    const data = await response.json();
    return data as UserStatsType;
  } catch (error) {
    throw new Error(`Failed fetching profile stats: ${error}`);
  }
};

const getProfilesSearch = async (
  username: string,
  limit?: number,
  skip?: number
): Promise<UserType[]> => {
  try {
    const response = await fetch(
      `${API_URL}/profiles/search?username=${username}${
        limit ? `&limit=${limit}` : ''
      }${skip ? `&skip=${skip}` : ''}`
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

export { getMe, getProfileById, getProfileStatsById, getProfilesSearch };
