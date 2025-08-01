import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ReCaptchaProvider } from './utils/recaptcha.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReCaptchaProvider>
      <App />
    </ReCaptchaProvider>
  </StrictMode>
);
