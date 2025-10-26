import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../styles/myListings.css";
import { AuthContext } from "../AuthContext";
import { toast } from "react-toastify";

const API = import.meta.env.VITE_API_URL;

const MyListings = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (!token) return;

    const fetchMyBooks = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/api/books/my-books`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // ✅ Ensure proper data parsing
        setBooks(res.data.books || res.data);
      } catch (err) {
        toast.error("Failed to fetch your listings");
        console.error("MyListings fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyBooks();
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this book?")) return;
    try {
      await axios.delete(`${API}/api/books/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks((prev) => prev.filter((b) => b._id !== id));
      toast.success("Book deleted successfully");
    } catch (err) {
      toast.error("Delete failed");
      console.error("Delete error:", err);
    }
  };

  if (!token) {
    return (
      <div className="my-listings-container">
        <h2>📚 My Book Listings</h2>
        <p>
          Please <Link to="/login">login</Link> or <Link to="/register">register</Link> to view your listings.
        </p>
      </div>
    );
  }

  return (
    <div className="my-listings-container">
      <h2 className="my-listings-title">📚 My Book Listings</h2>

      {loading ? (
        <p>Loading...</p>
      ) : books.length === 0 ? (
        <p className="no-books-msg">You haven’t listed any books yet.</p>
      ) : (
        <div className="my-books-grid">
          {books.map((book) => (
            <div className="book-card" key={book._id}>
              {book.image && (
                <img
                  src={book.image.startsWith("http") ? book.image : `${API}/uploads/${book.image}`}
                  alt={book.title}
                  className="book-thumbnail"
                />
              )}
              <h4>{book.title}</h4>
              <p><strong>Author:</strong> {Array.isArray(book.author) ? book.author.join(", ") : book.author}</p>
              <p><strong>Genre:</strong> {Array.isArray(book.genre) ? book.genre.join(", ") : book.genre}</p>
              <p><strong>Price:</strong> ₹{book.price}</p>
              <div className="book-actions">
                <Link to={`/edit-book/${book._id}`}>
                  <button className="edit-btn">✏️ Edit</button>
                </Link>
                <button className="delete-btn" onClick={() => handleDelete(book._id)}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListings;
