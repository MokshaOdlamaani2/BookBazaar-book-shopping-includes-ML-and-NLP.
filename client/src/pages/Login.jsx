import { useState, useContext } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import { toast } from "react-toastify";
import "../styles/authPages.css";

const API = process.env.REACT_APP_API_URL;



const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/auth/login`, { email, password });
      login(res.data.token, res.data.user);
      toast.success("Logged in");
      navigate("/my-listings");
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-box" onSubmit={handleLogin}>
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        <p>
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
