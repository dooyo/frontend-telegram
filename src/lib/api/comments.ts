import { API_URL } from './config';
import { getAuthToken } from './auth';
import { CommentType } from '@/lib/types';
import { PaginatedResponse, GetCommentsParams } from './types';

export const getPostComments = async (
  postId: string,
  params?: GetCommentsParams
): Promise<PaginatedResponse<CommentType>> => {
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

  const response = await fetch(
    `${API_URL}/comments/post/${postId}${
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
    throw new Error('Failed to fetch comments');
  }

  return response.json();
};

export const getUserComments = async (
  userId: string,
  params?: GetCommentsParams
): Promise<PaginatedResponse<CommentType>> => {
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

  const response = await fetch(
    `${API_URL}/comments/user/${userId}${
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
    throw new Error('Failed to fetch user comments');
  }

  return response.json();
};
