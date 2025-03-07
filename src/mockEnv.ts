import {
  emitEvent,
  mockTelegramEnv,
  retrieveLaunchParams
} from '@telegram-apps/sdk-react';

// It is important, to mock the environment only for development purposes. When building the
// application, import.meta.env.DEV will become false, and the code inside will be tree-shaken,
// so you will not see it in your final bundle.
if (import.meta.env.DEV || window.location.hostname.includes('github.io')) {
  let shouldMock: boolean;

  // Try to extract launch parameters to check if the current environment is Telegram-based.
  try {
    // If we are able to extract launch parameters, it means that we are already in the
    // Telegram environment. So, there is no need to mock it.
    retrieveLaunchParams();

    // We could previously mock the environment. In case we did, we should do it again. The reason
    // is the page could be reloaded, and we should apply mock again, because mocking also
    // enables modifying the window object.
    shouldMock = !!sessionStorage.getItem('____mocked');
  } catch (e) {
    // If we can't retrieve launch parameters, we should mock the environment
    shouldMock = true;
    console.log(
      'Unable to retrieve launch parameters, enabling mock environment'
    );
  }

  if (shouldMock) {
    const noInsets = {
      left: 0,
      top: 0,
      bottom: 0,
      right: 0
    } as const;
    const themeParams = {
      accent_text_color: '#6ab2f2',
      bg_color: '#17212b',
      button_color: '#5288c1',
      button_text_color: '#ffffff',
      destructive_text_color: '#ec3942',
      header_bg_color: '#17212b',
      hint_color: '#708499',
      link_color: '#6ab3f3',
      secondary_bg_color: '#232e3c',
      section_bg_color: '#17212b',
      section_header_text_color: '#6ab3f3',
      subtitle_text_color: '#708499',
      text_color: '#f5f5f5'
    } as const;

    try {
      mockTelegramEnv({
        launchParams: {
          tgWebAppThemeParams: themeParams,
          tgWebAppData: new URLSearchParams([
            [
              'user',
              JSON.stringify({
                id: 1,
                first_name: 'Pavel'
              })
            ],
            ['hash', ''],
            ['signature', ''],
            ['auth_date', Date.now().toString()]
          ]),
          tgWebAppStartParam: 'debug',
          tgWebAppVersion: '8',
          tgWebAppPlatform: 'tdesktop'
        },
        onEvent(e) {
          if (e[0] === 'web_app_request_theme') {
            return emitEvent('theme_changed', { theme_params: themeParams });
          }
          if (e[0] === 'web_app_request_viewport') {
            return emitEvent('viewport_changed', {
              height: window.innerHeight,
              width: window.innerWidth,
              is_expanded: true,
              is_state_stable: true
            });
          }
          if (e[0] === 'web_app_request_content_safe_area') {
            return emitEvent('content_safe_area_changed', noInsets);
          }
          if (e[0] === 'web_app_request_safe_area') {
            return emitEvent('safe_area_changed', noInsets);
          }
        }
      });
      sessionStorage.setItem('____mocked', '1');

      console.info(
        'Mock environment initialized successfully for development. Do not use this in production.'
      );
    } catch (error) {
      console.error('Failed to initialize mock environment:', error);
    }
  }
}
