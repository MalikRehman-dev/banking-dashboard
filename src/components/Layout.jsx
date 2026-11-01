import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useBank } from "../context/BankContext";
import Sidebar from "./Sidebar";
import Toast from "./Toast";

export default function Layout() {
  const { currentUser, toast } = useBank();
  const [menuOpen, setMenuOpen] = useState(false);

  // Login nahi hai to login page par bhej do
  if (!currentUser) return <Navigate to="/login" replace />;

  return (
    <div className="app">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)}></div>}

      <div className="main">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            ☰
          </button>
          <p className="greeting">Welcome back, <strong>{currentUser.name}</strong></p>
        </header>

        <div className="content">
          <Outlet />
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
