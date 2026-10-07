import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { errorMessage } from "../api";

const label =
  "mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted";
const input =
  "w-full rounded-lg border border-line bg-page px-3 py-2.5 outline-none focus:border-brand focus:bg-white";

export default function Login() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-4">
      <div className="w-full max-w-md rounded-xl border border-line bg-white p-8">
        <h1 className="font-serif text-2xl font-bold">Sign in</h1>
        <p className="mt-1 text-sm text-muted">Sales & Inventory Management</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className={label}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className={input}
            />
          </div>
          <div>
            <label className={label}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={input}
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand py-2.5 font-medium text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}