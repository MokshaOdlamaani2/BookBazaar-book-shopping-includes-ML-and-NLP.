# scripts/extract_tags.py
import pandas as pd
import json
from rake_nltk import Rake
from nltk.tokenize import sent_tokenize
import rake_nltk.rake

# Patch RAKE to use sentence tokenizer
rake_nltk.rake.Rake._tokenize_text_to_sentences = lambda self, text: sent_tokenize(text)

# Load CSV
df = pd.read_csv('data/books.csv').dropna(subset=['summary'])

rake = Rake()
tags_dict = {}

for idx, row in df.iterrows():
    rake.extract_keywords_from_text(row['summary'])
    tags = rake.get_ranked_phrases()[:5]  # Top 5 keywords
    tags_dict[int(row['index'])] = tags

# Save tags
with open("data/book_tags.json", "w") as f:
    json.dump(tags_dict, f)

print("✅ Tags saved to data/book_tags.json")
