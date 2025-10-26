import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("username");
    setLoggedIn(!!token);
    setUsername(token ? name : "");
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setLoggedIn(false);
    setUsername("");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      {/* LEFT SIDE */}
      <div className="navbar-left">
        <Link to="/" className="logo">
          📚 BookBazaar
        </Link>
        {/* Restricted links only visible to logged-in users */}
        {loggedIn && (
          <>
            <Link to="/add-book">Sell</Link>
            <Link to="/my-listings">My Listings</Link>
            <Link to="/favorites">🖤 Favorites</Link>
          </>
        )}
      </div>

      {/* RIGHT SIDE */}
      <div className="navbar-right">
        {/* Cart is always visible */}
        <Link to="/cart">🛒 Cart</Link>

        {/* User menu */}
        {loggedIn ? (
          <>
            <span className="navbar-username">👤 {username}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="login-btn">
              Login
            </Link>
            <Link to="/register" className="register-btn">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
