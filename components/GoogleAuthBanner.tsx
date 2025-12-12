import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface GoogleAuthBannerProps {
  isVisible: boolean;
  onDismiss: () => void;
  message?: string;
}

export default function GoogleAuthBanner({ isVisible, onDismiss, message }: GoogleAuthBannerProps) {
  if (!isVisible) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-yellow-700">
            <strong>Google access expired — reconnect required</strong>
            {message && <span className="block mt-1">{message}</span>}
          </p>
          <div className="mt-2">
            <div className="text-sm">
              <button
                onClick={() => window.location.href = '/api/auth/signin/google'}
                className="font-medium text-yellow-700 underline hover:text-yellow-600"
              >
                Reconnect Google Account
              </button>
            </div>
          </div>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={onDismiss}
              className="inline-flex rounded-md p-1.5 text-yellow-700 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
            >
              <span className="sr-only">Dismiss</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to manage Google auth banner state
export function useGoogleAuthBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');

  const showBanner = (errorMessage?: string) => {
    setMessage(errorMessage || 'Google access expired — reconnect required');
    setIsVisible(true);
  };

  const hideBanner = () => {
    setIsVisible(false);
    setMessage('');
  };

  return {
    isVisible,
    message,
    showBanner,
    hideBanner,
  };
}
