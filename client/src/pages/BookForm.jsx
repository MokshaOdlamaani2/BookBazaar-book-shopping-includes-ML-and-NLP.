import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
const API = process.env.REACT_APP_API_URL;

const BookForm = ({ book, setBook }) => {
  const [loading, setLoading] = useState(false);
  const [genrePredicted, setGenrePredicted] = useState(false);

  const handlePredictGenre = async () => {
    if (genrePredicted) return; // prevent multiple calls

    if (!book.summary) return toast.error("Book summary is required.");

    try {
      setLoading(true);
      const res = await axios.post(`${API}/api/ml/predict-genre`, {
        summary: book.summary,
      });
      setBook({ ...book, genre: res.data.predicted_genre });
      setGenrePredicted(true);
      toast.success("Genre predicted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Genre prediction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Title"
        value={book.title || ""}
        onChange={(e) => setBook({ ...book, title: e.target.value })}
      />
      <textarea
        placeholder="Summary"
        value={book.summary || ""}
        onChange={(e) => setBook({ ...book, summary: e.target.value })}
      />
      <input
        type="text"
        placeholder="Genre"
        value={book.genre || ""}
        readOnly
      />
      <button onClick={handlePredictGenre} disabled={loading || genrePredicted}>
        {loading ? "Predicting..." : "Predict Genre"}
      </button>
    </div>
  );
};

export default BookForm;
