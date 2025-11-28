const natural = require("natural");
const compromise = require("compromise");

// Danh sách từ khóa spam tiếng Việt và tiếng Anh
const spamKeywords = [
  // Tiếng Việt
  "khuyến mãi",
  "giảm giá",
  "miễn phí",
  "trúng thưởng",
  "kiếm tiền",
  "làm giàu",
  "click ngay",
  "nhấn vào",
  "đăng ký ngay",
  "cơ hội vàng",
  "thu nhập",
  "không mất phí",
  "nhanh tay",
  "số lượng có hạn",
  // Tiếng Anh
  "free",
  "winner",
  "congratulations",
  "prize",
  "click here",
  "buy now",
  "discount",
  "limited time",
  "act now",
  "earn money",
  "make money",
  "bitcoin",
  "crypto",
  "investment opportunity",
];

// Các mẫu spam phổ biến
const spamPatterns = [
  /\b(click|nhấn)\s+(here|vào|ngay)\b/gi,
  /\b\d+%\s*(off|giảm)/gi,
  /\b(free|miễn phí)\s+(money|tiền|gift|quà)/gi,
  /\$\d+/g,
  /(http|https):\/\/[^\s]+/g, // URLs
  /\b\d{10,}\b/g, // Số điện thoại dài
];

class SpamDetector {
  constructor() {
    this.classifier = new natural.BayesClassifier();
    this.trainClassifier();
  }

  // Huấn luyện classifier với dữ liệu mẫu
  trainClassifier() {
    // Spam samples
    const spamSamples = [
      "Chúc mừng bạn đã trúng thưởng 1 triệu đồng! Click vào link để nhận",
      "Kiếm tiền online dễ dàng, thu nhập 10 triệu/tháng",
      "Free bitcoin! Click here now to claim your prize",
      "Buy now! 90% discount limited time offer",
      "Congratulations! You won $1000. Click here to claim",
      "Cơ hội vàng làm giàu không cần vốn",
      "Đăng ký ngay để nhận quà miễn phí",
    ];

    // Not spam samples
    const notSpamSamples = [
      "Chào bạn, hôm nay bạn thế nào?",
      "Cuộc họp lúc 2 giờ chiều nhé",
      "Cảm ơn bạn đã giúp đỡ",
      "Hello, how are you today?",
      "Can we meet tomorrow?",
      "Thanks for your help",
      "Dự án này deadline khi nào vậy?",
    ];

    spamSamples.forEach((text) => this.classifier.addDocument(text, "spam"));
    notSpamSamples.forEach((text) =>
      this.classifier.addDocument(text, "notspam")
    );

    this.classifier.train();
  }

  // Phân tích tin nhắn
  analyzeMessage(content) {
    let spamScore = 0;
    const lowerContent = content.toLowerCase();

    // 1. Kiểm tra từ khóa spam (25 điểm mỗi từ)
    spamKeywords.forEach((keyword) => {
      if (lowerContent.includes(keyword.toLowerCase())) {
        spamScore += 25;
      }
    });

    // 2. Kiểm tra patterns (30 điểm mỗi pattern)
    spamPatterns.forEach((pattern) => {
      if (pattern.test(content)) {
        spamScore += 30;
      }
    });

    // 3. Sử dụng Naive Bayes classifier (0-40 điểm)
    const classifications = this.classifier.getClassifications(content);
    const spamClassification = classifications.find((c) => c.label === "spam");
    if (spamClassification) {
      spamScore += spamClassification.value * 40;
    }

    // 4. Kiểm tra CHỮ IN HOA quá nhiều (20 điểm)
    const uppercaseRatio =
      (content.match(/[A-Z]/g) || []).length / content.length;
    if (uppercaseRatio > 0.5 && content.length > 10) {
      spamScore += 20;
    }

    // 5. Kiểm tra dấu chấm than quá nhiều (15 điểm)
    const exclamationCount = (content.match(/!/g) || []).length;
    if (exclamationCount > 2) {
      spamScore += 15;
    }

    // 6. Kiểm tra số lượng emoji quá nhiều (10 điểm)
    const emojiCount = (
      content.match(
        /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu
      ) || []
    ).length;
    if (emojiCount > 5) {
      spamScore += 10;
    }

    // Chuẩn hóa điểm về 0-100
    spamScore = Math.min(spamScore, 100);

    return {
      isSpam: spamScore >= 50, // Ngưỡng 50/100
      spamScore: Math.round(spamScore),
      confidence: spamScore >= 50 ? "high" : spamScore >= 30 ? "medium" : "low",
    };
  }

  // Kiểm tra tin nhắn có phải spam không
  isSpam(content) {
    const result = this.analyzeMessage(content);
    return result.isSpam;
  }

  // Lấy điểm spam
  getSpamScore(content) {
    const result = this.analyzeMessage(content);
    return result.spamScore;
  }
}

// Singleton instance
const spamDetector = new SpamDetector();

module.exports = spamDetector;
