import { NavLink, useNavigate } from "react-router-dom";
import { useBank } from "../context/BankContext";

const links = [
  { to: "/", label: "Dashboard", icon: "🏠" },
  { to: "/transactions", label: "Transactions", icon: "📜" },
  { to: "/transfer", label: "Transfer", icon: "💸" },
  { to: "/settings", label: "Account Settings", icon: "⚙️" },
];

export default function Sidebar({ open, onClose }) {
  const { logout, currentUser } = useBank();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <aside className={open ? "sidebar open" : "sidebar"}>
      <div className="logo">
        <span className="logo-mark">P</span>
        <span>PayPak</span>
      </div>

      <nav className="nav">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.to === "/"} onClick={onClose}
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            <span>{link.icon}</span> {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p className="small">{currentUser.accountNumber}</p>
        <button className="btn btn-light" onClick={handleLogout}>Logout</button>
      </div>
    </aside>
  );
}
