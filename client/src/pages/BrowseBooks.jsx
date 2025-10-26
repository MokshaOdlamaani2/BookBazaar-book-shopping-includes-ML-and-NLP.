import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import debounce from "lodash/debounce";

import {
  saveInteraction,
  getLikedBooks,
  toggleLikeBook,
  getRecentlyViewedBooks,
  addToCart,
} from "../utils/recommendationUtils";
import { addFavorite, removeFavorite } from "../utils/favorites";
import "../styles/browseBooks.css";

// ✅ Use Vite environment variable syntax
const API = import.meta.env.VITE_API_URL;

const BrowseBooks = () => {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [condition, setCondition] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [recentViews, setRecentViews] = useState([]);
  const [likedBooks, setLikedBooks] = useState([]);
  const [showRecent, setShowRecent] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const userId = localStorage.getItem("userId");
  const suggestionBoxRef = useRef(null);
  const cachedQueries = useRef({}); // Cache previous autocomplete queries

  // 🔁 Fetch books whenever filters change
  useEffect(() => {
    fetchBooks();
  }, [search, genre, condition, page]);

  // 📚 Load recently viewed books and liked books
  useEffect(() => {
    loadRecentViews();
    setLikedBooks(getLikedBooks());
  }, []);

  // 🧠 Fetch books from API
  const fetchBooks = async () => {
    try {
      const res = await axios.get(`${API}/api/books/all`, {
        params: { search, genre, condition, page, limit: 12 },
      });

      const newBooks = Array.isArray(res.data.books) ? res.data.books : [];
      setBooks((prev) => (page === 1 ? newBooks : [...prev, ...newBooks]));
      setHasMore(res.data.hasMore ?? false);
    } catch (error) {
      console.error("❌ Error fetching books:", error);
      toast.error("Failed to load books");
    }
  };

  // 🕒 Load recently viewed books
  const loadRecentViews = async () => {
    const recent = await getRecentlyViewedBooks();
    setRecentViews(recent);
  };

  // 🛒 Add book to cart
  const handleAddToCart = (book) => {
    const added = addToCart(book);
    if (added) {
      toast.success("Added to cart");
    } else {
      toast.info("Already in cart");
    }
  };

  // ❤️ Toggle favorite (like/unlike)
  const handleToggleLike = async (book) => {
    const bookId = book._id;
    const updatedLikes = getLikedBooks();

    try {
      if (updatedLikes.includes(bookId)) {
        await removeFavorite(userId, bookId);
        toast.info("Removed from favorites");
      } else {
        await addFavorite(userId, bookId);
        toast.success("Added to favorites");
      }

      toggleLikeBook(bookId);
      setLikedBooks(getLikedBooks());
    } catch (err) {
      console.error("❌ Error toggling like:", err);
      toast.error("Something went wrong");
    }
  };

  // 📖 Pagination
  const handleLoadMore = () => setPage((prev) => prev + 1);

  // ♻️ Clear all filters
  const clearFilters = () => {
    setSearch("");
    setGenre("");
    setCondition("");
    setPage(1);
  };

  // 🧠 Handle autocomplete selection
  const handleSuggestionClick = (text) => {
    setSearch(text);
    setShowSuggestions(false);
    setPage(1);
  };

  // 🔍 Debounced autocomplete with caching
  const debouncedFetchSuggestions = useRef(
    debounce(async (query) => {
      if (query.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      // Use cached results if available
      if (cachedQueries.current[query]) {
        setSuggestions(cachedQueries.current[query]);
        setShowSuggestions(true);
        return;
      }

      try {
        const res = await axios.get(`${API}/api/ml/autocomplete`, {
          params: { q: query },
        });
        const suggs = res.data.suggestions || [];
        cachedQueries.current[query] = suggs; // Save to cache
        setSuggestions(suggs);
        setShowSuggestions(true);
      } catch (err) {
        console.error("❌ Autocomplete error:", err);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300)
  ).current;

  useEffect(() => {
    debouncedFetchSuggestions(search);
    return () => debouncedFetchSuggestions.cancel();
  }, [search]);

  // 🧭 Close suggestions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        suggestionBoxRef.current &&
        !suggestionBoxRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 📘 Render a single book card
  const renderBookCard = (book) => (
    <div className="browse-book-card" key={book._id}>
      <div className="browse-book-left">
        <img
          src={
            book.image?.startsWith("http")
              ? book.image
              : `${API}/uploads/${book.image}`
          }
          alt={book.title}
          className="browse-book-thumb"
        />
        <button
          className="browse-add-cart-btn"
          onClick={() => handleAddToCart(book)}
          title="Add to cart"
        >
          🛒 Add to Cart
        </button>
      </div>
      <div className="browse-book-info">
        <h4>{book.title}</h4>
        <p>{book.author}</p>
        <button
          className="browse-like-btn"
          onClick={() => handleToggleLike(book)}
          title="Toggle Favorite"
        >
          {likedBooks.includes(book._id) ? "❤️" : "🤍"}
        </button>
        <Link
          to={`/books/${book._id}`}
          className="browse-view-link"
          onClick={() => saveInteraction(book._id, "click")}
        >
          View Details
        </Link>
      </div>
    </div>
  );

  return (
    <div className="browse-wrapper">
      <aside className="browse-filter-sidebar">
        <h3>🔍 Filters</h3>

        {/* Search with autocomplete */}
        <div className="browse-filter-group" ref={suggestionBoxRef}>
          <label>Search</label>
          <input
            type="text"
            placeholder="Search by title"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            autoComplete="off"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="suggestion-dropdown">
              {suggestions.map((s, i) => (
                <li key={i} onClick={() => handleSuggestionClick(s)}>
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Genre filter */}
        <div className="browse-filter-group">
          <label>Genre</label>
          <select
            value={genre}
            onChange={(e) => {
              setGenre(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Genres</option>
            <option>Fiction</option>
            <option>Science</option>
            <option>History</option>
            <option>Romance</option>
            <option>Fantasy</option>
            <option>Biography</option>
          </select>
        </div>

        {/* Condition filter */}
        <div className="browse-filter-group">
          <label>Condition</label>
          <select
            value={condition}
            onChange={(e) => {
              setCondition(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option>New</option>
            <option>Used</option>
          </select>
        </div>

        <button className="clear-filters-btn" onClick={clearFilters}>
          Clear Filters
        </button>
      </aside>

      {/* Main content */}
      <main className="browse-main-content">
        <section className="browse-all-books-section">
          <h3>📘 Available Books</h3>
          <div className="browse-book-grid">
            {books.length === 0 ? (
              <div className="empty-state">
                <p>No books match your search. Try different filters.</p>
              </div>
            ) : (
              books.map(renderBookCard)
            )}
          </div>

          {hasMore && (
            <button className="browse-load-more" onClick={handleLoadMore}>
              Load More
            </button>
          )}
          <hr />
        </section>

        {/* Recently Viewed */}
        {recentViews.length > 0 && (
          <section className="browse-recent-section">
            <div className="browse-recent-header">
              <h3>🕒 Recently Viewed</h3>
              <button
                className="browse-toggle-btn"
                onClick={() => setShowRecent(!showRecent)}
              >
                {showRecent ? "Hide" : "Show"}
              </button>
            </div>

            {showRecent && (
              <div className="browse-book-grid">
                {recentViews.map(renderBookCard)}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default BrowseBooks;
