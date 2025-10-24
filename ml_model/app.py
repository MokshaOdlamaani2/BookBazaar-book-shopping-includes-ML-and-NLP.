from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
import yake
from suggestion_model import SuggestionEngine

# Initialize Flask
app = Flask(__name__)
CORS(app)

# ✅ Load genre prediction model
try:
    genre_model = joblib.load('model/model.pkl')
    genre_vectorizer = joblib.load('model/vectorizer.pkl')
    print("✅ Genre model and vectorizer loaded successfully.")
except Exception as e:
    print("❌ Error loading ML model or vectorizer:", e)
    genre_model, genre_vectorizer = None, None

# ✅ Initialize autocomplete engine
try:
    suggest_engine = SuggestionEngine('data/books.csv')
    print("✅ Suggestion engine initialized with books.csv.")
except Exception as e:
    print("❌ Error initializing SuggestionEngine:", e)
    suggest_engine = None

# 🧠 Genre prediction
@app.route('/predict-genre', methods=['POST'])
def predict_genre():
    data = request.get_json(force=True)
    summary = data.get('summary', '').strip()
    if not summary:
        return jsonify({'error': 'Summary required'}), 400

    if not genre_model or not genre_vectorizer:
        return jsonify({'error': 'Model not loaded'}), 500

    try:
        vec = genre_vectorizer.transform([summary])
        prediction = genre_model.predict(vec)[0]
        return jsonify({'predicted_genre': prediction})
    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

# 🏷️ Tag extraction
@app.route('/extract-tags', methods=['POST'])
def extract_tags():
    data = request.get_json(force=True)
    summary = data.get('summary', '').strip()
    if not summary:
        return jsonify({'error': 'Summary required'}), 400

    try:
        kw_extractor = yake.KeywordExtractor(lan="en", n=1, top=10)
        keywords = kw_extractor.extract_keywords(summary)
        tags = [kw for kw, _ in keywords]
        return jsonify({'tags': tags})
    except Exception as e:
        return jsonify({'error': f'Tag extraction failed: {str(e)}'}), 500

# 🔤 Autocomplete
@app.route('/autocomplete', methods=['GET'])
def autocomplete():
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify([])

    if not suggest_engine:
        return jsonify({'error': 'Suggestion engine not loaded'}), 500

    try:
        suggestions = suggest_engine.suggest_titles(query)
        return jsonify(suggestions)
    except Exception as e:
        return jsonify({'error': f'Autocomplete failed: {str(e)}'}), 500

@app.route('/')
def home():
    return jsonify({"message": "📚 ML API is running!", "endpoints": ["/predict-genre", "/extract-tags", "/autocomplete"]})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 7860))  # Hugging Face default port
    app.run(host='0.0.0.0', port=port)
