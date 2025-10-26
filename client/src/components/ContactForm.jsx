import { useState } from "react";
import axios from "axios";
import "../styles/addBook.css";

const API = import.meta.env.VITE_API_URL;

const ContactForm = ({ sellerEmail }) => {
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setLoading(true);

    try {
      await axios.post(`${API}/api/contact`, {
        sellerEmail,
        buyerName,
        buyerEmail,
        message,
      });
      setStatus("✅ Message sent successfully!");
      setBuyerName("");
      setBuyerEmail("");
      setMessage("");
    } catch (err) {
      console.error("Contact form error:", err);
      setStatus("❌ Failed to send message. Try again.");
    } finally {
      setLoading(false);

      // Optional: clear status after 5 seconds
      setTimeout(() => setStatus(""), 5000);
    }
  };

  return (
    <div className="contact-form">
      <h3>Contact Seller</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Your Name"
          value={buyerName}
          onChange={(e) => setBuyerName(e.target.value)}
          required
          disabled={loading}
        />
        <input
          type="email"
          placeholder="Your Email"
          value={buyerEmail}
          onChange={(e) => setBuyerEmail(e.target.value)}
          required
          disabled={loading}
        />
        <textarea
          placeholder="Your Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
      {status && <p className="status-msg">{status}</p>}
    </div>
  );
};

export default ContactForm;
