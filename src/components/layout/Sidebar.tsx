import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun, faUser } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../contexts/ThemeContext";
import UserProfileModal from "../common/UserProfileModal";
import type { Project } from "../../types/project";
import type { User } from "../../types/user";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  projects: Project[];
  onCreateProject: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({
  projects,
  onCreateProject,
  isOpen = false,
  onClose,
}: SidebarProps) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleUpdateUser = () => {
    // User is updated in localStorage by the service
    // Context will be updated on next render
  };

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`}>
      {/* Close button for mobile */}
      <button
        className={styles.closeBtn}
        onClick={onClose}
        aria-label="Close menu"
      >
        ×
      </button>

      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        </div>
        <span className={styles.logoText}>TASKER</span>
      </div>

      <nav className={styles.nav}>
        <NavLink to="/dashboard" className={styles.navItem}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span>Home</span>
        </NavLink>

        <div className={styles.navSection}>
          <div className={styles.navHeader}>
            <div className={styles.navItem + " " + styles.active}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
              <span>Projects</span>
            </div>
          </div>

          <button onClick={onCreateProject} className={styles.addProjectBtn}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            Add Project
          </button>

          <div className={styles.projectList}>
            {projects.map((project) => (
              <NavLink
                key={project._id}
                to={`/projects/${project._id}`}
                className={({ isActive }) =>
                  `${styles.projectItem} ${isActive ? styles.activeProject : ""}`
                }
              >
                <span className={styles.projectDot}>●</span>
                {project.name}
              </NavLink>
            ))}
          </div>
        </div>

        <NavLink to="/calendar" className={styles.navItem}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z" />
          </svg>
          <span>Calendar</span>
        </NavLink>

        <NavLink to="/messages" className={styles.navItem}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
          </svg>
          <span>Messages</span>
        </NavLink>
      </nav>

      <div className={styles.sidebarFooter}>
        <button
          onClick={toggleTheme}
          className={styles.themeToggle}
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          <FontAwesomeIcon icon={theme === "light" ? faMoon : faSun} />
          <span>{theme === "light" ? "Dark" : "Light"} Mode</span>
        </button>

        <div className={styles.footerActions}>
          <button
            onClick={() => setShowProfileModal(true)}
            className={styles.profileBtn}
            title="User Profile"
          >
            <FontAwesomeIcon icon={faUser} />
          </button>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      {showProfileModal && user && (
        <UserProfileModal
          user={user}
          onClose={() => setShowProfileModal(false)}
          onUpdate={handleUpdateUser}
        />
      )}
    </aside>
  );
};

export default Sidebar;
