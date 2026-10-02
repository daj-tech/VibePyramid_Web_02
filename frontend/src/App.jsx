import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Educational from "./pages/Educational";
import Community from "./pages/Community";
import InternshipsSkills from "./pages/InternshipsSkills";
import Local from "./pages/Local";
import Events from "./pages/Events";
import Emergencies from "./pages/Emergencies";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <>
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/educational" element={<Educational />} />
            <Route path="/community" element={<Community />} />
            <Route path="/internships-skills" element={<InternshipsSkills />} />
            <Route path="/local" element={<Local />} />
            <Route path="/events" element={<Events />} />
            <Route path="/emergencies" element={<Emergencies />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
