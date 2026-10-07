import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import api, { errorMessage } from "../api";
import { useAuth } from "../AuthContext";
import { inputCls, labelCls } from "../ui";

export default function Register() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/register", form);
      await login(form.email, form.password);
    } catch (err) {
      setError(errorMessage(err));
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-4">
      <div className="w-full max-w-md rounded-xl border border-line bg-white p-8">
        <h1 className="font-serif text-2xl font-bold">Create account</h1>
        <p className="mt-1 text-sm text-muted">Sales & Inventory Management</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className={labelCls}>Name</label>
            <input
              required
              className={inputCls}
              value={form.name}
              onChange={set("name")}
            />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input
              required
              type="email"
              className={inputCls}
              value={form.email}
              onChange={set("email")}
            />
          </div>
          <div>
            <label className={labelCls}>Password (min 6 characters)</label>
            <input
              required
              type="password"
              minLength={6}
              maxLength={72}
              className={inputCls}
              value={form.password}
              onChange={set("password")}
            />
          </div>
          <div>
            <label className={labelCls}>Role (open for demo testing)</label>
            <select
              className={inputCls}
              value={form.role}
              onChange={set("role")}
            >
              <option value="user">User</option>
              <option value="manager">Manager</option>
            </select>
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
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link to="/login" className="text-brand hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
