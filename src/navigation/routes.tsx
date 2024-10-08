import type { ComponentType, JSX } from 'react';
import { FeedPage } from '@/pages/FeedPage/FeedPage';
import { SignInPage } from '@/pages/SignInPage/SignInPage';
import { SignUpPage } from '@/pages/SignUpPage/SignUpPage';
import { ProfilePage } from '@/pages/ProfilePage/ProfilePage';
import { NewPostPage } from '@/pages/NewPostPage/NewPostPage';
import { PostPage } from '@/pages/PostPage/PostPage';
import { FriendsPage } from '@/pages/FriendsPage/FriendsPage';
import { FriendsSearchPage } from '@/pages/FriendsSearchPage/FriendsSearchPage';
import { OtpPage } from '@/pages/OtpPage/OtpPage';

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
  layout?: boolean;
}

export const routes: Route[] = [
  { path: '/', Component: FeedPage, title: 'Feed', layout: true },
  { path: '/signIn', Component: SignInPage, title: 'Sign In' },
  { path: '/signUp', Component: SignUpPage, title: 'Sign Up' },
  { path: '/otp', Component: OtpPage, title: 'OTP' },
  {
    path: '/profile/:id',
    Component: ProfilePage,
    title: 'Profile',
    layout: true
  },
  { path: '/newPost', Component: NewPostPage, title: 'New Post', layout: true },
  {
    path: '/post/:id',
    Component: PostPage,
    title: 'What a post!',
    layout: true
  },
  {
    path: '/friends',
    Component: FriendsPage,
    layout: true
  },
  {
    path: '/friendsSearch',
    Component: FriendsSearchPage,
    layout: true
  }
];
