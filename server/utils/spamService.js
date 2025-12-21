const axios = require("axios");

async function checkSpam(text) {
  try {
    const res = await axios.post(
      "http://localhost:5001/check-spam",
      { text },
      { timeout: 3000 }
    );
    return res.data;
  } catch (err) {
    console.error("Spam API error:", err.message);
    // fallback: cho qua nếu API lỗi
    return { isSpam: false, spamProbability: 0 };
  }
}

module.exports = { checkSpam };
