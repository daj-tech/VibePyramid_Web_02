import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      navigate(location.state?.from?.pathname || "/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">LL</div>
        <span className="eyebrow">WELCOME BACK</span>
        <h1>Login to LocalLink</h1>
        <p>Access your local information dashboard.</p>
        {error && <div className="alert error">{error}</div>}
        <form onSubmit={submit} className="form">
          <label>Username<input required value={form.username} onChange={e => setForm({...form, username:e.target.value})} placeholder="Enter username" /></label>
          <label>Password<input required type="password" value={form.password} onChange={e => setForm({...form, password:e.target.value})} placeholder="Enter password" /></label>
          <button disabled={loading} className="button button-primary button-full">{loading ? "Signing in..." : "Login"}</button>
        </form>
        <p className="auth-switch">Don't have an account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
}
