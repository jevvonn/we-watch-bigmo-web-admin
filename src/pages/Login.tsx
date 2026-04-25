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
    <div className="min-h-screen flex items-center justify-center p-6 bg-canvas relative overflow-hidden">
      {/* Soft ambient blobs */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-sage/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-sage/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-[420px]">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center">
            <img src="/logo-green.png" alt="Narabuna" className="w-8 h-8" />
          </div>
          <span className="mt-3 text-lg font-bold tracking-tight text-ink">
            Narabuna
          </span>
        </div>

        {/* Card */}
        <div className="bg-surface border border-line rounded-2xl p-8 shadow-sm">
          <div className="text-center">
            <h2 className="text-[26px] font-extrabold tracking-tight">
              Welcome back
            </h2>
            <p className="mt-1.5 text-muted text-sm">
              Sign in to your nursing dashboard
            </p>
          </div>

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
              <div className="flex items-center gap-2.5 bg-canvas border border-line rounded-xl px-3.5 focus-within:border-sage focus-within:ring-2 focus-within:ring-sage/20 transition">
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
              <div className="flex items-center gap-2.5 bg-canvas border border-line rounded-xl px-3.5 focus-within:border-sage focus-within:ring-2 focus-within:ring-sage/20 transition">
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
        </div>
      </div>
    </div>
  );
}
