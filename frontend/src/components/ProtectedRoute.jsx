import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute() {
  const [state, setState] = useState({ loading: true, authenticated: false });
  const location = useLocation();

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setState({ loading: false, authenticated: data.authenticated }))
      .catch(() => setState({ loading: false, authenticated: false }));
  }, [location.pathname]);

  if (state.loading) {
    return <div className="page-center"><div className="spinner" />Checking session...</div>;
  }

  return state.authenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}
