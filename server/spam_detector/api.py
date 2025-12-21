from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
import sys

print(">>> 🐍 Python Spam Detector API starting...")
print(f">>> Python version: {sys.version}")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, "spam_model.pkl")

print(f">>> 📂 Loading model from: {model_path}")

# Kiểm tra file model có tồn tại không
if not os.path.exists(model_path):
    print(f"❌ ERROR: Model file not found at {model_path}")
    print("💡 Please run: python train.py")
    sys.exit(1)

try:
    model = joblib.load(model_path)
    print("✅ Model loaded successfully!")
except Exception as e:
    print(f"❌ ERROR loading model: {e}")
    sys.exit(1)

app = Flask(__name__)
CORS(app)

# ✅ Health check endpoint
@app.route("/", methods=["GET"])
def health_check():
    return jsonify({
        "status": "running",
        "service": "Spam Detector API",
        "version": "1.0"
    }), 200

# ✅ Spam detection endpoint
@app.route("/check-spam", methods=["POST"])
def check_spam():
    try:
        data = request.get_json()

        if not data or "text" not in data:
            return jsonify({"error": "No text provided"}), 400

        text = data["text"]
        
        if not text or not isinstance(text, str) or len(text.strip()) == 0:
            return jsonify({"error": "Invalid text"}), 400

        # Predict
        probs = model.predict_proba([text])[0]
        ham_prob = float(probs[0])
        spam_prob = float(probs[1])

        # Log
        print(f"📨 Text: {text[:50]}...")
        print(f"📊 Spam: {spam_prob:.2%} | Ham: {ham_prob:.2%}")

        return jsonify({
            "isSpam": spam_prob > 0.5,
            "spamProbability": round(spam_prob, 4),
            "hamProbability": round(ham_prob, 4)
        }), 200

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("\n" + "="*50)
    print("🚀 Spam Detector API running!")
    print("📍 URL: http://localhost:5001")
    print("📍 Health: http://localhost:5001/")
    print("📍 Check spam: POST http://localhost:5001/check-spam")
    print("="*50 + "\n")
    
    # ✅ Bind đến 127.0.0.1 (IPv4 only) thay vì 0.0.0.0
    app.run(host="127.0.0.1", port=5001, debug=False)