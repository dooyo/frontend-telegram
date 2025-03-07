import { FC, ReactNode } from 'react';
import { retrieveLaunchParams } from '@telegram-apps/sdk-react';

interface AppRootProps {
  platform: 'ios' | 'base';
  children?: ReactNode;
}

const AppRoot: FC<AppRootProps> = ({ platform, children }) => {
  return <div className={`app-root ${platform}`}>{children}</div>;
};

export const App: FC = () => {
  const lp = retrieveLaunchParams();

  return (
    <AppRoot
      platform={['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'}
    ></AppRoot>
  );
};
