import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { User as UserIcon, Lock, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(identifier, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-ink text-cream p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 bg-sage rounded-xl flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              <path
                d="M8 24V8l8 8 8-8v16"
                stroke="#FBF8F2"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight">
            Marigold Care
          </span>
        </div>

        <div className="relative z-10">
          <h1 className="text-[44px] font-extrabold tracking-tight leading-[1.05] max-w-md">
            Care that travels with your patients.
          </h1>
          <p className="mt-5 text-cream/70 max-w-md leading-relaxed text-[15px]">
            Stay close to those in your care — message securely and respond fast
            when it matters most.
          </p>
          <div className="mt-10 flex gap-2.5">
            <span className="w-8 h-1 rounded-full bg-sage" />
            <span className="w-2 h-1 rounded-full bg-cream/30" />
            <span className="w-2 h-1 rounded-full bg-cream/30" />
          </div>
        </div>

        <div className="relative z-10 text-[11px] text-cream/40 font-mono">
          © 2026 Marigold Care · v2.4.0
        </div>

        <div className="absolute -bottom-32 -right-32 w-[480px] h-[480px] bg-sage/20 rounded-full blur-3xl" />
        <div className="absolute -top-20 -right-20 w-[300px] h-[300px] bg-sage/10 rounded-full blur-3xl" />
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-canvas">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-sage rounded-xl flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                <path
                  d="M8 24V8l8 8 8-8v16"
                  stroke="#FBF8F2"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight">
              Marigold Care
            </span>
          </div>

          <h2 className="text-[28px] font-extrabold tracking-tight">
            Welcome back
          </h2>
          <p className="mt-1.5 text-muted text-sm">
            Sign in to your nursing dashboard
          </p>

          {error && (
            <div className="mt-6 flex items-start gap-2 p-3 bg-crit-bg border border-crit/20 rounded-xl text-crit text-[13px]">
              <AlertCircle
                size={16}
                strokeWidth={2}
                className="shrink-0 mt-px"
              />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-muted uppercase tracking-[0.08em] mb-2 font-mono">
                Username or Email
              </label>
              <div className="flex items-center gap-2.5 bg-surface border border-line rounded-xl px-3.5 focus-within:border-sage focus-within:ring-2 focus-within:ring-sage/20 transition">
                <UserIcon size={16} strokeWidth={1.75} className="text-muted" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  autoComplete="username"
                  placeholder="username"
                  className="flex-1 py-3 bg-transparent border-0 outline-none text-ink text-sm placeholder:text-muted"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[11px] font-bold text-muted uppercase tracking-[0.08em] font-mono">
                  Password
                </label>
                <a
                  href="#"
                  className="text-[11px] text-sage-d font-semibold hover:underline"
                >
                  Forgot?
                </a>
              </div>
              <div className="flex items-center gap-2.5 bg-surface border border-line rounded-xl px-3.5 focus-within:border-sage focus-within:ring-2 focus-within:ring-sage/20 transition">
                <Lock size={16} strokeWidth={1.75} className="text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="flex-1 py-3 bg-transparent border-0 outline-none text-ink text-sm placeholder:text-muted"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !identifier || !password}
              className="w-full py-3 bg-sage hover:bg-sage-d text-cream font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="mt-8 pt-5 border-t border-line-soft">
            <p className="text-[11px] text-muted text-center font-mono">
              Protected health information · End-to-end encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
