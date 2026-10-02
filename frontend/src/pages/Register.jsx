import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ name:"", username:"", password:"", region:"Thane", local_area:"Thane West" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card register-card">
        <div className="auth-brand">LL</div>
        <span className="eyebrow">JOIN THE COMMUNITY</span>
        <h1>Create your account</h1>
        <p>Your account gives you access to the LocalLink prototype.</p>
        {error && <div className="alert error">{error}</div>}
        <form onSubmit={submit} className="form">
          <label>Name<input required value={form.name} onChange={e => setForm({...form,name:e.target.value})} /></label>
          <label>Username<input required minLength="3" value={form.username} onChange={e => setForm({...form,username:e.target.value})} /></label>
          <label>Password<input required minLength="6" type="password" value={form.password} onChange={e => setForm({...form,password:e.target.value})} /></label>
          <div className="form-row">
            <label>Region<select value={form.region} onChange={e => setForm({...form,region:e.target.value})}><option>Thane</option></select></label>
            <label>Local Area<select value={form.local_area} onChange={e => setForm({...form,local_area:e.target.value})}><option>Thane West</option><option>Thane East</option><option>Wagle Estate</option><option>Ghodbunder Road</option><option>Manpada</option></select></label>
          </div>
          <button disabled={loading} className="button button-primary button-full">{loading ? "Creating..." : "Create Account"}</button>
        </form>
        <p className="auth-switch">Already registered? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}
