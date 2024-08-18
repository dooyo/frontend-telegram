import { FC, useEffect, useMemo, ReactNode } from 'react';
import {
  bindMiniAppCSSVars,
  bindThemeParamsCSSVars,
  bindViewportCSSVars,
  initNavigator,
  useLaunchParams,
  useMiniApp,
  useThemeParams,
  useViewport
} from '@telegram-apps/sdk-react';

interface AppRootProps {
  platform: 'ios' | 'base';
  children?: ReactNode;
}

const AppRoot: FC<AppRootProps> = ({ platform, children }) => {
  return <div className={`app-root ${platform}`}>{children}</div>;
};

export const App: FC = () => {
  const lp = useLaunchParams();
  const miniApp = useMiniApp();
  const themeParams = useThemeParams();
  const viewport = useViewport();

  useEffect(() => {
    bindMiniAppCSSVars(miniApp, themeParams);
  }, [miniApp, themeParams]);

  useEffect(() => {
    bindThemeParamsCSSVars(themeParams);
  }, [themeParams]);

  useEffect(() => {
    if (viewport) {
      bindViewportCSSVars(viewport);
    }
  }, [viewport]);

  const navigator = useMemo(() => initNavigator('app-navigation-state'), []);

  useEffect(() => {
    navigator.attach();
    return () => navigator.detach();
  }, [navigator]);

  return (
    <AppRoot
      platform={['macos', 'ios'].includes(lp.platform) ? 'ios' : 'base'}
    ></AppRoot>
  );
};
