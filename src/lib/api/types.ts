export interface CreatePostData {
  text: string;
  mentionedUserIds?: string[];
}

export interface CreateCommentData {
  text: string;
  mentionedUserIds?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
  total: number;
}

export interface GetCommentsParams {
  cursor?: string;
  limit?: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GetNotificationsParams {
  cursor?: string;
  limit?: number;
}

export interface GetPostsParams {
  cursor?: string;
  limit?: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  userIds?: string[];
}

export interface NotificationType {
  _id: string;
  title: string;
  content: string;
  type:
    | 'follow'
    | 'like'
    | 'comment'
    | 'system'
    | 'fren_post'
    | 'reward'
    | 'mention';
  isRead: boolean;
  createdAt: string;
  metadata?: {
    postId?: string;
    userId?: string;
    commentId?: string;
    tgId?: number;
    rewardId?: string;
    rewardType?: 'POST_LIFETIME' | 'COMMENT_LIFETIME';
    amount?: number;
  };
}
