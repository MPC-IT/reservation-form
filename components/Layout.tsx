// components/Layout.tsx
import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { GoogleAuthProvider } from "../contexts/GoogleAuthContext";
import GoogleReconnectBanner from "./GoogleReconnectBanner";

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const pathname = router.pathname;

    // Do not load user or redirect on auth pages
    if (pathname.startsWith("/auth")) {
      return;
    }

    async function loadUser() {
      try {
        const res = await fetch("/api/users/me");

        if (res.ok) {
          const data = await res.json();
          setUser(data.user ?? data);
        } else if (status === "unauthenticated") {
          router.push("/auth/login");
        }
      } catch {
        if (status === "unauthenticated") {
          router.push("/auth/login");
        }
      }
    }

    if (status !== "loading") {
      loadUser();
    }
  }, [router.pathname, status]);

  // ------------------------------
  // LOGOUT (clears both sessions)
  // ------------------------------
  async function logout() {
    try {
      // Clear custom cookie-based session
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore failures — logout should still proceed
    }

    // Clear NextAuth (Google) session and redirect
    await signOut({ callbackUrl: "/auth/login" });
  }

  const hideNav = router.pathname.startsWith("/auth");

  if (hideNav) {
    return (
      <main className="min-h-screen bg-surface flex items-center justify-center">
        {children}
      </main>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-secondary">Loading...</div>
      </div>
    );
  }

  const isAdmin = user.role === "admin";

  return (
    <GoogleAuthProvider>
      <div className="min-h-screen bg-surface flex">
        {/* Google Reconnect Banner - shown at the top */}
        <GoogleReconnectBanner />
        
        {/* Sidebar */}
      <aside className="nav-sidebar">
        {/* Logo */}
        <div className="p-6 border-b border-custom">
          <div className="flex items-center justify-center">
            <Image
              src="/images/mpc-logo.png"
              alt="MPC Logo"
              width={110}
              height={110}
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <a
            href="/dashboard"
            className={`nav-item ${
              router.pathname === "/dashboard" ? "active" : ""
            }`}
          >
            <span>Dashboard</span>
          </a>

          <a
            href="/admin/reservations"
            className={`nav-item ${
              router.pathname === "/admin/reservations" ? "active" : ""
            }`}
          >
            <span>All Reservations</span>
          </a>

          <a
            href="/reservations/create"
            className={`nav-item ${
              router.pathname.startsWith("/reservations/create") ? "active" : ""
            }`}
          >
            <span>New Reservation</span>
          </a>

          {isAdmin && (
            <div className="pt-4 mt-4 border-t border-custom">
              <a
                href="/admin"
                className={`nav-item ${
                  router.pathname === "/admin" ? "active" : ""
                }`}
              >
                <span>Admin Settings</span>
              </a>
            </div>
          )}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-custom">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center text-sm font-medium">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-primary">
                  {user.name}
                </p>
                <p className="text-xs text-muted capitalize">
                  {user.role}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-2 text-muted hover:text-primary transition-colors"
              title="Logout"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <main className="main-content">{children}</main>
      </div>
    </div>
    </GoogleAuthProvider>
  );
}
