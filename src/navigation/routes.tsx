import type { ComponentType, JSX } from 'react';
import { FeedPage } from '@/pages/FeedPage/FeedPage';
import { SignInPage } from '@/pages/SignInPage/SignInPage';

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
}

export const routes: Route[] = [
  { path: '/', Component: FeedPage, title: 'Feed' },
  { path: '/signIn', Component: SignInPage, title: 'Sign In' }
];
