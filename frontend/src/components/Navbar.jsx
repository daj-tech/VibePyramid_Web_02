import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [authenticated, setAuthenticated] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setAuthenticated(Boolean(d.authenticated)))
      .catch(() => setAuthenticated(false));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setAuthenticated(false);
    navigate("/");
  }

  const close = () => setOpen(false);

  return (
    <header className="navbar">
      <div className="nav-inner">
        <Link className="brand" to="/" onClick={close}>
          <span className="brand-mark">LL</span>
          <span>Local<span>Link</span></span>
        </Link>

        <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
          ☰
        </button>

        <nav className={open ? "nav-links open" : "nav-links"}>
          <NavLink to="/" onClick={close} className={({isActive}) => isActive ? "active" : ""}>Home</NavLink>
          <NavLink to="/about" onClick={close} className={({isActive}) => isActive ? "active" : ""}>About</NavLink>

          {authenticated ? (
            <>
              <NavLink to="/dashboard" onClick={close} className={({isActive}) => isActive ? "active" : ""}>Dashboard</NavLink>
              <NavLink to="/calendar" onClick={close} className={({isActive}) => isActive ? "active" : ""}>Calendar</NavLink>
              <NavLink to="/settings" onClick={close} className={({isActive}) => isActive ? "active" : ""}>Settings</NavLink>
              <button className="nav-logout" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={close} className={({isActive}) => isActive ? "active" : ""}>Login</NavLink>
              <Link to="/register" onClick={close} className="nav-register">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
