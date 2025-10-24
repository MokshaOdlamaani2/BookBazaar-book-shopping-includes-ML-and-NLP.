from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
import logging
import dotenv
import yake
from suggestion_model import SuggestionEngine

# Load environment variables
dotenv.load_dotenv()

# Initialize Flask
app = Flask(__name__)
CORS(app)

# Logging
logging.basicConfig(level=logging.INFO)

# Load genre prediction model
MODEL_DIR = os.environ.get("MODEL_DIR", "model")
GENRE_MODEL_PATH = os.path.join(MODEL_DIR, "model.pkl")
VECTORIZER_PATH = os.path.join(MODEL_DIR, "vectorizer.pkl")

try:
    genre_model = joblib.load(GENRE_MODEL_PATH)
    genre_vectorizer = joblib.load(VECTORIZER_PATH)
    logging.info("✅ Genre model and vectorizer loaded successfully.")
except Exception as e:
    logging.error("❌ Error loading ML model or vectorizer: %s", e)
    genre_model, genre_vectorizer = None, None

# Initialize suggestion engine
DATA_DIR = os.environ.get("DATA_DIR", "data")
BOOKS_CSV = os.path.join(DATA_DIR, "books.csv")
try:
    suggest_engine = SuggestionEngine(BOOKS_CSV)
    logging.info("✅ Suggestion engine initialized with books.csv.")
except Exception as e:
    logging.error("❌ Error initializing SuggestionEngine: %s", e)
    suggest_engine = None

# Genre prediction endpoint
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
        logging.error("Prediction error: %s", e)
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

# Tag extraction endpoint
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
        logging.error("Tag extraction error: %s", e)
        return jsonify({'error': f'Tag extraction failed: {str(e)}'}), 500

# Autocomplete endpoint
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
        logging.error("Autocomplete error: %s", e)
        return jsonify({'error': f'Autocomplete failed: {str(e)}'}), 500

@app.route('/')
def home():
    return jsonify({
        "message": "📚 ML API is running!",
        "endpoints": ["/predict-genre", "/extract-tags", "/autocomplete"]
    })

if __name__ == '__main__':
    PORT = int(os.environ.get("PORT", 7860))
    app.run(host='0.0.0.0', port=PORT)
