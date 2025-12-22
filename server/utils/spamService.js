const axios = require("axios");

const SPAM_API_URL = process.env.SPAM_API_URL || "http://127.0.0.1:5001";

/**
 * Kiểm tra tin nhắn có phải spam không bằng Python ML model
 * @param {string} text - Nội dung tin nhắn cần kiểm tra
 * @returns {Promise<{isSpam: boolean, spamProbability: number, hamProbability: number}>}
 */
async function checkSpam(text) {
  // Kiểm tra input
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return {
      isSpam: false,
      spamProbability: 0,
      hamProbability: 1,
    };
  }

  try {
    console.log(`🔍 Calling Python API at ${SPAM_API_URL}/check-spam`);

    const res = await axios.post(
      `${SPAM_API_URL}/check-spam`,
      { text: text.trim() },
      {
        timeout: 5000,
        headers: {
          "Content-Type": "application/json",
        },
        family: 4,
      }
    );

    console.log("✅ Spam API response:", res.data);

    return {
      isSpam: res.data.isSpam || false,
      spamProbability: res.data.spamProbability || 0,
      hamProbability: res.data.hamProbability || 1,
    };
  } catch (err) {
    console.error("❌ Spam API error:", err.message);

    // ⚠️ QUAN TRỌNG: Log chi tiết lỗi
    if (err.code === "ECONNREFUSED") {
      console.error("🚨 Cannot connect to Python API!");
      console.error(`   Trying to connect to: ${SPAM_API_URL}`);
      console.error("   Make sure Python API is running: python api.py");
    } else if (err.code === "ETIMEDOUT") {
      console.error("⏱️ Python API timeout!");
    }

    // Fallback: Cho phép tin nhắn đi qua nếu API lỗi
    return {
      isSpam: false,
      spamProbability: 0,
      hamProbability: 1,
      error: err.message,
    };
  }
}

/**
 * Kiểm tra xem Python API có đang chạy không
 * @returns {Promise<boolean>}
 */
async function checkAPIHealth() {
  try {
    const res = await axios.get(`${SPAM_API_URL}/`, {
      timeout: 2000,
      family: 4,
    });
    return res.status === 200;
  } catch (err) {
    return false;
  }
}

module.exports = {
  checkSpam,
  checkAPIHealth,
};
