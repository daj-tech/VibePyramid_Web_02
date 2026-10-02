import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [region, setRegion] = useState(localStorage.getItem("locallink_region") || "Thane");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/auth/me", {credentials:"include"}).then(r=>r.json()).then(d=>setUser(d.user));
  }, []);

  function save() {
    localStorage.setItem("locallink_region", region);
    alert("Settings saved.");
  }

  async function logout() {
    await fetch("/api/auth/logout", {method:"POST", credentials:"include"});
    navigate("/");
  }

  return (
    <div className="page section">
      <div className="page-header"><span className="eyebrow">ACCOUNT</span><h1>Settings</h1><p>Manage your prototype profile and local area.</p></div>
      <div className="settings-grid">
        <section className="settings-card">
          <span className="eyebrow">PROFILE</span>
          <h2>{user?.name || "LocalLink user"}</h2>
          <div className="setting-row"><span>Username</span><strong>{user?.username || "—"}</strong></div>
          <div className="setting-row"><span>Region</span><strong>{user?.region || "Thane"}</strong></div>
          <div className="setting-row"><span>Local Area</span><strong>{user?.local_area || "—"}</strong></div>
        </section>
        <section className="settings-card">
          <span className="eyebrow">LOCAL PREFERENCE</span>
          <h2>Selected region</h2>
          <label>Region<select value={region} onChange={e=>setRegion(e.target.value)}><option>Thane</option></select></label>
          <button className="button button-primary" onClick={save}>Save Settings</button>
        </section>
        <section className="settings-card danger-card">
          <span className="eyebrow">SESSION</span>
          <h2>Sign out</h2>
          <p>End your current LocalLink session.</p>
          <button className="button button-danger" onClick={logout}>Logout</button>
        </section>
      </div>
    </div>
  );
}
