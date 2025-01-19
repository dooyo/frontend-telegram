import { API_URL } from './config';
import { getAuthToken } from './auth';

export interface NotificationType {
  _id: string;
  title: string;
  content: string;
  type: 'follow' | 'like' | 'comment' | 'system' | 'fren_post';
  isRead: boolean;
  createdAt: string;
  metadata?: {
    postId?: string;
    userId?: string;
    commentId?: string;
  };
}

interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
  total: number;
  hasMore: boolean;
}

interface GetNotificationsParams {
  cursor?: string;
  limit?: number;
}

export const getNotifications = async (
  params?: GetNotificationsParams
): Promise<PaginatedResponse<NotificationType>> => {
  const authToken = await getAuthToken();
  if (!authToken) {
    return { data: [], total: 0, hasMore: false };
  }

  const searchParams = new URLSearchParams();
  if (params?.cursor) searchParams.append('cursor', params.cursor);
  if (params?.limit) searchParams.append('limit', params.limit.toString());

  const response = await fetch(
    `${API_URL}/notifications${
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
    throw new Error('Failed to fetch notifications');
  }

  return response.json();
};

export const getUnreadCount = async (): Promise<number> => {
  const authToken = await getAuthToken();
  if (!authToken) {
    return 0;
  }

  const response = await fetch(`${API_URL}/notifications/unread-count`, {
    method: 'GET',
    headers: {
      Authorization: authToken,
      'Content-Type': 'application/json'
    }
  });

  if (response.status !== 200) {
    throw new Error('Failed to fetch unread count');
  }

  const data = await response.json();
  return data.count;
};

export const markAsRead = async (notificationId: string): Promise<void> => {
  const authToken = await getAuthToken();
  if (!authToken) return;

  const response = await fetch(
    `${API_URL}/notifications/${notificationId}/read`,
    {
      method: 'PATCH',
      headers: {
        Authorization: authToken,
        'Content-Type': 'application/json'
      }
    }
  );

  if (response.status !== 200) {
    throw new Error('Failed to mark notification as read');
  }
};

export const markAllAsRead = async (): Promise<void> => {
  const authToken = await getAuthToken();
  if (!authToken) return;

  const response = await fetch(`${API_URL}/notifications/read-all`, {
    method: 'PATCH',
    headers: {
      Authorization: authToken,
      'Content-Type': 'application/json'
    }
  });

  if (response.status !== 200) {
    throw new Error('Failed to mark all notifications as read');
  }
};
