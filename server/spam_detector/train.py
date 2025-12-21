import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report

# 1. Load dataset
df = pd.read_csv("data/spam.csv", encoding="latin-1")

# Chỉ giữ cột cần thiết
df = df[["v1", "v2"]]
df.columns = ["label", "message"]

print("\n📊 LABEL DISTRIBUTION:")
print(df["label"].value_counts())

# 2. Encode label
df["label"] = df["label"].map({"ham": 0, "spam": 1})

# 3. Train / Test split
X_train, X_test, y_train, y_test = train_test_split(
    df["message"],
    df["label"],
    test_size=0.2,
    random_state=42,
    stratify=df["label"]
)

# 4. Pipeline
model = Pipeline([
    ("tfidf", TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),     # quan trọng
        min_df=2
    )),
    ("clf", MultinomialNB(alpha=0.3))  # alpha nhỏ hơn để bớt gắt
])

# 5. Train
model.fit(X_train, y_train)

# 6. Evaluate
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print("\n🎯 ACCURACY:", accuracy)
print("\n📄 REPORT:")
print(classification_report(y_test, y_pred))

# 7. Save model
joblib.dump(model, "spam_model.pkl")
print("\n💾 Model saved as spam_model.pkl")
