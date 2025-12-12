// pages/_app.tsx

import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import Layout from "../components/Layout";
import { GoogleAuthProvider, useGoogleAuth } from "../contexts/GoogleAuthContext";
import GoogleAuthBanner from "../components/GoogleAuthBanner";
import "../styles/globals.css";

function AppContent({ Component, pageProps, router }: AppProps) {
  const { showReconnectBanner, googleAuthError, clearAuthError } = useGoogleAuth();

  return (
    <Layout>
      <GoogleAuthBanner
        isVisible={showReconnectBanner}
        onDismiss={clearAuthError}
        message={googleAuthError || undefined}
      />
      <Component {...pageProps} />
    </Layout>
  );
}

export default function App({ Component, pageProps, router }: AppProps) {
  return (
    <SessionProvider>
      <GoogleAuthProvider>
        <AppContent Component={Component} pageProps={pageProps} router={router} />
      </GoogleAuthProvider>
    </SessionProvider>
  );
}
