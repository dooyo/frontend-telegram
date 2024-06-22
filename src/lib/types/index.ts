// TODO: shared types with backend

export type UserType = {
  _id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  expiresAt: string;
};

export type PostType = {
  _id: string;
  user: UserType;
  createdAt: string;
  image?: string;
  numberOfComments?: number;
  numberOfRetweets?: number;
  numberOfLikes?: number;
  impressions?: number;
  text: string;
  comments: CommentType[];
  likes: string[];
  dislikes: string[];
  expiresAt: string;
  reactions: string[];
};

export type CommentType = {
  _id: string;
  user: UserType;
  createdAt: string;
  text: string;
  likes: string[];
  dislikes: string[];
  expiresAt: string;
  post: string;
};

export type Following = {
  _id: string;
  user: UserType;
  followerUser: UserType;
  createdAt: string;
};
