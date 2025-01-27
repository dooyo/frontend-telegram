import { API_URL } from './config';
import { getAuthToken } from './auth';

export interface TotalRewardsResponse {
  total: number;
}

export interface RewardHistory {
  _id: string;
  userId: string;
  contentId: string;
  type: 'POST_LIFETIME' | 'COMMENT_LIFETIME';
  amount: number;
  contentCreatedAt: string;
  contentExpiredAt: string;
  createdAt: string;
}

export interface RewardHistoryResponse {
  rewards: RewardHistory[];
  total: number;
}

export const getTotalRewards = async (
  userId: string
): Promise<TotalRewardsResponse> => {
  const authToken = await getAuthToken();
  if (!authToken) {
    return { total: 0 };
  }

  const response = await fetch(`${API_URL}/rewards/total?userId=${userId}`, {
    method: 'GET',
    headers: {
      Authorization: authToken,
      'Content-Type': 'application/json'
    }
  });

  if (response.status !== 200) {
    throw new Error('Failed to fetch total rewards');
  }

  return response.json();
};

export const getRewardsHistory = async (
  userId: string,
  limit: number = 5,
  skip: number = 0
): Promise<RewardHistoryResponse> => {
  const authToken = await getAuthToken();
  if (!authToken) {
    return { rewards: [], total: 0 };
  }

  const response = await fetch(
    `${API_URL}/rewards/history?userId=${userId}&limit=${limit}&skip=${skip}`,
    {
      method: 'GET',
      headers: {
        Authorization: authToken,
        'Content-Type': 'application/json'
      }
    }
  );

  if (response.status !== 200) {
    throw new Error('Failed to fetch rewards history');
  }

  return response.json();
};
