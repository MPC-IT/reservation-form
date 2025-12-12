// pages/auth/login.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const { callbackUrl } = router.query;

  const redirectTarget =
    typeof callbackUrl === "string" && callbackUrl.trim()
      ? callbackUrl
      : "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // ------------------------------
  // Credentials Login (your cookie session)
  // ------------------------------
  async function handleCredentialsLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "Invalid email or password");
        setLoading(false);
        return;
      }

      // Cookie was set by /api/auth/login, now navigate
      window.location.href = redirectTarget;
    } catch (err) {
      console.error("Credentials login error:", err);
      setError("Login failed. Please try again.");
      setLoading(false);
    }
  }

  // ------------------------------
  // Google Login (NextAuth)
  // ------------------------------
  async function handleGoogleLogin() {
    setError("");
    setLoading(true);

    // NextAuth will handle the redirect for us
    await signIn("google", { callbackUrl: redirectTarget });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="card">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-primary mb-2">
              Welcome Back
            </h2>
            <p className="text-secondary">
              Log in to your MPC Reservation System account
            </p>

            {error && (
              <div className="mt-4 p-4 bg-error/10 border border-error/20 text-error rounded-lg">
                {error}
              </div>
            )}
          </div>

          {/* Credentials Form */}
          <form className="mt-8 space-y-6" onSubmit={handleCredentialsLogin}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="label">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="password" className="label">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link
                  href="/auth/forgot-password"
                  className="font-medium text-accent hover:text-accent-hover transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? "Signing in…" : "Log in"}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-surface px-2 text-secondary">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="mt-6 w-full btn btn-secondary"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}
