import sys
import joblib
import re

# Load model
model = joblib.load("spam_model.pkl")

text = sys.argv[1].lower()

# ===============================
# 🔥 RULE SPAM MẠNH (ÍT FALSE POSITIVE)
# ===============================
STRONG_SPAM_PATTERNS = [
    r"free\s+entry",
    r"win\s+\$?\d+",
    r"won\s+\$?\d+",
    r"click\s+here",
    r"limited\s+time",
    r"act\s+now",
    r"congratulations.*won",
]

for pattern in STRONG_SPAM_PATTERNS:
    if re.search(pattern, text):
        print("🚨 SPAM (strong rule)")
        sys.exit()

# ===============================
# 🤖 MACHINE LEARNING
# ===============================
proba = model.predict_proba([text])[0]
ham_prob = proba[0]
spam_prob = proba[1]

print(f"HAM prob : {ham_prob:.2f}")
print(f"SPAM prob: {spam_prob:.2f}")

# ===============================
# 🎯 DECISION (THRESHOLD HỢP LÝ)
# ===============================
if spam_prob >= 0.6:
    print("🚨 SPAM (ml)")
else:
    print("✅ HAM")
