import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const navLinks = [
    { to: "/", label: "Dashboard", icon: "📊" },
    { to: "/scenarios", label: "Scenarios", icon: "🎯" },
    { to: "/leaderboard", label: "Leaderboard", icon: "🏆" },
    { to: "/profile", label: "Profile", icon: "👤" },
  ];

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <div style={styles.logoIcon}>🛡️</div>
          <div>
            <span style={styles.logoText}>CyberSec</span>
            <span style={styles.logoSub}> Sim</span>
          </div>
        </Link>

        {/* Desktop links */}
        <div style={styles.links}>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                ...styles.link,
                ...(isActive(link.to) ? styles.activeLink : {}),
              }}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        {/* User chip */}
        <div style={styles.userChip}>
          <div style={styles.userAvatar}>
            {(user.username || "U")[0].toUpperCase()}
          </div>
          <span style={styles.userName}>{user.username || "User"}</span>
        </div>

        {/* Mobile burger */}
        <button
          style={styles.burger}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                ...styles.mobileLink,
                ...(isActive(link.to) ? styles.activeMobileLink : {}),
              }}
              onClick={() => setMenuOpen(false)}
            >
              {link.icon} {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

const styles = {
  nav: {
    background: "#fff",
    borderBottom: "1px solid #e2e8f0",
    position: "sticky", top: 0, zIndex: 100,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  inner: {
    maxWidth: 1100, margin: "0 auto",
    padding: "0 24px", height: 64,
    display: "flex", alignItems: "center", gap: 24,
  },
  logo: {
    display: "flex", alignItems: "center", gap: 10,
    textDecoration: "none", flexShrink: 0,
  },
  logoIcon: {
    width: 36, height: 36, borderRadius: 10,
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 18,
  },
  logoText: { fontWeight: 800, fontSize: 18, color: "#0f172a" },
  logoSub: { fontWeight: 400, fontSize: 18, color: "#64748b" },
  links: {
    display: "flex", gap: 4, flex: 1,
    "@media (max-width: 640px)": { display: "none" },
  },
  link: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "8px 14px", borderRadius: 10,
    textDecoration: "none", fontSize: 14, fontWeight: 500,
    color: "#64748b", transition: "background 0.15s, color 0.15s",
  },
  activeLink: {
    background: "#eff6ff", color: "#2563eb", fontWeight: 600,
  },
  userChip: {
    display: "flex", alignItems: "center", gap: 8,
    marginLeft: "auto", background: "#f8fafc",
    border: "1px solid #e2e8f0", borderRadius: 50,
    padding: "6px 14px 6px 6px",
  },
  userAvatar: {
    width: 28, height: 28, borderRadius: "50%",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "#fff", display: "flex", alignItems: "center",
    justifyContent: "center", fontWeight: 700, fontSize: 12,
  },
  userName: { fontSize: 13, fontWeight: 600, color: "#374151" },
  burger: {
    display: "none", background: "none", border: "none",
    fontSize: 20, cursor: "pointer", color: "#374151",
    "@media (max-width: 640px)": { display: "block" },
  },
  mobileMenu: {
    display: "flex", flexDirection: "column",
    background: "#fff", borderTop: "1px solid #e2e8f0",
    padding: "8px 16px 16px",
  },
  mobileLink: {
    display: "block", padding: "12px 16px", borderRadius: 10,
    textDecoration: "none", color: "#374151", fontWeight: 500,
    fontSize: 15,
  },
  activeMobileLink: { background: "#eff6ff", color: "#2563eb", fontWeight: 700 },
};