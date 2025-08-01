import React, { createContext, useContext, ReactNode } from 'react';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';

// reCAPTCHA site key - replace with your actual site key
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Test key

interface ReCaptchaContextType {
  executeRecaptcha: (action: string) => Promise<string | null>;
}

const ReCaptchaContext = createContext<ReCaptchaContextType | null>(null);

export const ReCaptchaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_SITE_KEY}>
      <ReCaptchaProviderInner>
        {children}
      </ReCaptchaProviderInner>
    </GoogleReCaptchaProvider>
  );
};

const ReCaptchaProviderInner: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { executeRecaptcha: googleExecuteRecaptcha } = useGoogleReCaptcha();

  const executeRecaptcha = async (action: string): Promise<string | null> => {
    if (!googleExecuteRecaptcha) {
      console.warn('reCAPTCHA not yet available');
      return null;
    }

    try {
      const token = await googleExecuteRecaptcha(action);
      return token;
    } catch (error) {
      console.error('reCAPTCHA execution failed:', error);
      return null;
    }
  };

  return (
    <ReCaptchaContext.Provider value={{ executeRecaptcha }}>
      {children}
    </ReCaptchaContext.Provider>
  );
};

export const useReCaptcha = () => {
  const context = useContext(ReCaptchaContext);
  if (!context) {
    throw new Error('useReCaptcha must be used within a ReCaptchaProvider');
  }
  return context;
};
