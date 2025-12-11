// components/Layout.tsx
import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
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
        } else {
          router.push("/auth/login");
        }
      } catch {
        router.push("/auth/login");
      }
    }

    loadUser();
  }, [router.pathname]);

  async function logout() {
    await fetch("/api/auth/logout");
    router.push("/auth/login");
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
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <aside className="nav-sidebar">
        {/* Logo */}
        <div className="p-6 border-b border-custom">
          <div className="flex items-center justify-center">
            <Image src="/images/mpc-logo.png" alt="MPC Logo" width={110} height={110} />
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
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Dashboard</span>
          </a>

          <a
            href="/reservations/create"
            className={`nav-item ${
              router.pathname.startsWith("/reservations/create") ? "active" : ""
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Reservation</span>
          </a>

          <a
            href="/admin/reservations"
            className={`nav-item ${
              router.pathname === "/admin/reservations" ? "active" : ""
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>All Reservations</span>
          </a>

          {isAdmin && (
            <a
              href="/admin"
              className={`nav-item ${
                router.pathname === "/admin" ? "active" : ""
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Admin</span>
            </a>
          )}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-custom">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center text-sm font-medium">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-primary">{user.name}</p>
                <p className="text-xs text-muted capitalize">{user.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-muted hover:text-primary transition-colors"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top header */}
        <header className="header">
          <h2 className="text-xl font-semibold text-primary capitalize">
            {router.pathname.split("/").pop()?.replace("-", " ") || "Dashboard"}
          </h2>
          <div className="flex items-center space-x-3">
            <div className="text-sm text-secondary">
              {user.name}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
