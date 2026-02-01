import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import styles from "./Home.module.css";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>Welcome to TaskPro{user ? `, ${user.username}` : ""}!</h1>
        <p>Manage your projects and tasks efficiently with our Kanban board system.</p>
        <button onClick={() => navigate("/dashboard/projects")} className={styles.btn}>
          View All Projects
        </button>
      </div>
    </div>
  );
};

export default Home;
