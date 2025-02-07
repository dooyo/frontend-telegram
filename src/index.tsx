import ReactDOM from 'react-dom/client';
import { Root } from '@/components/Root';
import TelegramAnalytics from '@telegram-apps/analytics';

// Uncomment this import in case, you would like to develop the application even outside
// the Telegram application, just in your browser.
import './mockEnv.ts';

import './index.css';
import { init, initData } from '@telegram-apps/sdk-react';

// Initialize Telegram Analytics
TelegramAnalytics.init({
  token: import.meta.env.VITE_TELEGRAM_ANALYTICS_TOKEN, // Using Vite environment variable
  appName: 'dooyoapp20250205'
});

init();
initData.restore();

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />);
