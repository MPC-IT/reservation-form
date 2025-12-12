import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';

interface GoogleAuthContextType {
  showReconnectBanner: boolean;
  googleAuthError: string | null;
  handleGoogleAuthError: (error: any) => void;
  reconnectGoogle: () => void;
  clearAuthError: () => void;
}

const GoogleAuthContext = createContext<GoogleAuthContextType | undefined>(undefined);

export function GoogleAuthProvider({ children }: { children: ReactNode }) {
  const [showReconnectBanner, setShowReconnectBanner] = useState(false);
  const [googleAuthError, setGoogleAuthError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Check for existing auth errors on mount and route changes
  useEffect(() => {
    const pathname = router.pathname;
    
    // Don't show banner on auth routes
    if (pathname.startsWith('/auth')) {
      setShowReconnectBanner(false);
      return;
    }

    // Check for stored auth errors
    const storedError = sessionStorage.getItem('googleAuthError');
    if (storedError) {
      setGoogleAuthError(storedError);
      setShowReconnectBanner(true);
    }

    // Clear banner if user has valid Google session
    if (session?.accessToken && status === 'authenticated') {
      clearAuthError();
    }
  }, [router.pathname, session, status]);

  const handleGoogleAuthError = (error: any) => {
    const pathname = router.pathname;
    
    // Don't handle errors on auth routes
    if (pathname.startsWith('/auth')) {
      return;
    }

    let errorMessage = '';
    
    // Enhanced detection of Google auth failures with more specific error types
    if (
      error?.status === 401 || 
      error?.status === 403 ||
      error?.requiresReauth ||
      (typeof error?.message === 'string' && (
        error.message.includes('invalid authentication credentials') ||
        error.message.includes('insufficient authentication scopes') ||
        error.message.includes('access token expired') ||
        error.message.includes('invalid_grant') ||
        error.message.includes('unauthorized')
      )) ||
      (typeof error === 'string' && (
        error.includes('invalid authentication credentials') ||
        error.includes('insufficient authentication scopes') ||
        error.includes('access token expired') ||
        error.includes('unauthorized')
      ))
    ) {
      // Use enhanced error messages based on error type
      if (error?.errorType === 'auth_failure') {
        errorMessage = error.message || 'Google authentication failed. Please sign in with Google again.';
      } else if (error?.requiresReauth) {
        errorMessage = 'Google access expired. Please reconnect your Google account.';
      } else {
        errorMessage = typeof error?.message === 'string' ? error.message : error || 'Google authentication failed';
      }
      
      setGoogleAuthError(errorMessage);
      setShowReconnectBanner(true);
      
      // Store error for persistence across route changes
      sessionStorage.setItem('googleAuthError', errorMessage);
    }
  };

  const reconnectGoogle = async () => {
    try {
      await signIn("google", { 
        prompt: "consent", 
        callbackUrl: window.location.pathname 
      });
    } catch (error) {
      console.error('Failed to initiate Google sign-in:', error);
    }
  };

  const clearAuthError = () => {
    setGoogleAuthError(null);
    setShowReconnectBanner(false);
    sessionStorage.removeItem('googleAuthError');
  };

  const value: GoogleAuthContextType = {
    showReconnectBanner,
    googleAuthError,
    handleGoogleAuthError,
    reconnectGoogle,
    clearAuthError,
  };

  return (
    <GoogleAuthContext.Provider value={value}>
      {children}
    </GoogleAuthContext.Provider>
  );
}

export function useGoogleAuth() {
  const context = useContext(GoogleAuthContext);
  if (context === undefined) {
    throw new Error('useGoogleAuth must be used within a GoogleAuthProvider');
  }
  return context;
}
