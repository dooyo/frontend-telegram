// TODO: shared types with backend

export interface UserType {
  _id: string;
  username: string;
  avatarUrl?: string;
  expiresAt?: string;
  isPremium: boolean;
}

export interface UserStatsType {
  totalComments: number;
  totalCommentsLikes: number;
  totalCommentsDislikes: number;
  totalCommentsDuration: number;
  totalPosts: number;
  totalPostsLikes: number;
  totalPostsDislikes: number;
  totalPostsDuration: number;
}

export interface PostType {
  _id: string;
  text: string;
  user: UserType;
  likes: string[];
  dislikes: string[];
  commentedBy: string[];
  commentCount: number;
  reactions: string[];
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentType {
  _id: string;
  text: string;
  user: UserType;
  post: string;
  likes: string[];
  dislikes: string[];
  reactions: string[];
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Following {
  _id: string;
  user: UserType;
  followerUser: UserType;
  createdAt: string;
  updatedAt: string;
}
