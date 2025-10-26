import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

// ✅ Vite environment variable
const API = import.meta.env.VITE_API_URL;

const BookDetail = () => {
  const { id } = useParams();
  const [bookData, setBookData] = useState(null);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        // ✅ Updated API path to include /api
        const res = await axios.get(`${API}/api/books/${id}`);
        setBookData(res.data);

        // Tags caching
        const cachedTags = sessionStorage.getItem(`tags-${id}`);
        if (cachedTags) {
          setTags(JSON.parse(cachedTags));
        } else if (res.data.summary) {
          const tagRes = await axios.post(`${API}/api/ml/extract-tags`, {
            summary: res.data.summary,
          });
          const fetchedTags = tagRes.data.tags || [];
          setTags(fetchedTags);
          sessionStorage.setItem(`tags-${id}`, JSON.stringify(fetchedTags));
        }
      } catch (err) {
        console.error("❌ Failed to fetch book:", err);
      }
    };

    fetchBook();
  }, [id]);

  if (!bookData) return <div>Loading...</div>;

  return (
    <div>
      <h1>{bookData.title}</h1>
      <p>{bookData.summary}</p>
      <div>
        <strong>Tags:</strong> {tags.join(", ")}
      </div>
    </div>
  );
};

export default BookDetail;
