# scripts/create_embeddings.py
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
import joblib
import os

df = pd.read_csv('data/books.csv').dropna(subset=['summary'])

vectorizer = TfidfVectorizer(max_features=5000, stop_words='english')
X = vectorizer.fit_transform(df['summary'])

os.makedirs('data/ml', exist_ok=True)
joblib.dump(X.toarray(), "data/ml/embeddings.pkl")
joblib.dump(df['index'].tolist(), "data/ml/book_ids.pkl")
joblib.dump(vectorizer, "data/ml/vectorizer.pkl")

print("✅ Embeddings and vectorizer saved to data/ml/")
