from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os

print(">>> api.py loaded")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, "spam_model.pkl")
print(">>> loading model from:", model_path)

model = joblib.load(model_path)

app = Flask(__name__)
CORS(app)

@app.route("/check-spam", methods=["POST"])
def check_spam():
    data = request.get_json()

    if not data or "text" not in data:
        return jsonify({"error": "No text provided"}), 400

    text = data["text"]

    probs = model.predict_proba([text])[0]
    ham_prob = float(probs[0])
    spam_prob = float(probs[1])

    return jsonify({
        "isSpam": spam_prob > 0.5,
        "spamProbability": round(spam_prob, 4),
        "hamProbability": round(ham_prob, 4)
    })

if __name__ == "__main__":
    print("🚀 Spam Detector API running at http://localhost:5001")
    app.run(host="0.0.0.0", port=5001)


