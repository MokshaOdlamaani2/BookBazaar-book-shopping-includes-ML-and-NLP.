import { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import "../styles/myListings.css";

const API = import.meta.env.VITE_API_URL;

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [pastOrders, setPastOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) setCartItems(JSON.parse(storedCart));

    if (token) fetchPastOrders();
  }, [token]);

  const fetchPastOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await axios.get(`${API}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPastOrders(res.data.orders || res.data);
    } catch (err) {
      console.error("Fetch past orders error:", err);
      toast.error("Failed to load past orders");
    } finally {
      setLoadingOrders(false);
    }
  }, [token]);

  const handleRemove = useCallback(
    (bookId) => {
      const updatedCart = cartItems.filter((item) => item._id !== bookId);
      setCartItems(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      toast.info("Removed from cart");
    },
    [cartItems]
  );

  const total = useMemo(
    () => cartItems.reduce((sum, book) => sum + (Number(book.price) || 0), 0),
    [cartItems]
  );

  const handleCheckout = async () => {
    if (!token) return toast.error("Please login to place an order");
    if (cartItems.length === 0) return toast.error("Cart is empty");

    setCheckoutLoading(true);
    try {
      const res = await axios.post(
        `${API}/api/orders`,
        { items: cartItems, total },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Clear cart
      setCartItems([]);
      localStorage.removeItem("cart");
      toast.success("✅ Order placed successfully");

      // Update past orders
      setPastOrders((prev) => [res.data.order || res.data, ...prev]);
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error(err.response?.data?.error || "Failed to place order");
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="cart-container">
        <h2>🛒 Your Cart</h2>
        <p>
          Please <Link to="/login">login</Link> or <Link to="/register">register</Link> to access your cart and orders.
        </p>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h2>🛒 Your Cart</h2>

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul className="cart-list">
            {cartItems.map((book) => (
              <li key={book._id} className="cart-item">
                <img
                  src={book.image?.startsWith("http") ? book.image : `${API}/uploads/${book.image}`}
                  alt={book.title}
                  className="cart-thumb"
                />
                <div>
                  <h4>{book.title}</h4>
                  <p>
                    Author: {Array.isArray(book.author) ? book.author.join(", ") : book.author}
                  </p>
                  <p>Price: ₹{Number(book.price).toFixed(2)}</p>
                  <button onClick={() => handleRemove(book._id)} disabled={checkoutLoading}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="checkout-summary">
            <p><strong>Total:</strong> ₹{total.toFixed(2)}</p>
            <button
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? "Processing..." : "Proceed to Checkout"}
            </button>
          </div>
        </>
      )}

      {loadingOrders ? (
        <p>Loading your past orders...</p>
      ) : pastOrders.length > 0 ? (
        <section className="past-orders">
          <h3>Your Past Orders</h3>
          {pastOrders.map((order) => (
            <div key={order._id} className="order-card">
              <p><strong>Ordered on:</strong> {new Date(order.orderedAt).toLocaleString()}</p>
              <p><strong>Total:</strong> ₹{Number(order.total).toFixed(2)}</p>
              <ul>
                {order.items.map((item, idx) => (
                  <li key={item.bookId || idx}>
                    {item.title || "Untitled"} - ₹{Number(item.price).toFixed(2)} × {item.quantity || 1}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ) : (
        <p>No past orders yet.</p>
      )}
    </div>
  );
};

export default Cart;
