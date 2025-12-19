const natural = require("natural");
const compromise = require("compromise");

// Spam keywords và patterns
const SPAM_KEYWORDS = [
  "win",
  "winner",
  "won",
  "cash",
  "prize",
  "free",
  "click here",
  "congratulations",
  "urgent",
  "act now",
  "limited time",
  "offer",
  "bonus",
  "discount",
  "promotion",
  "deal",
  "buy now",
  "order now",
  "make money",
  "earn money",
  "work from home",
  "guarantee",
  "no obligation",
  "risk free",
  "satisfaction guaranteed",
  "call now",
  "subscribe",
  "unsubscribe",
  "viagra",
  "pills",
  "weight loss",
  "credit card",
  "loan",
  "debt",
  "investment",

  // Vietnamese spam
  "vay tien",
  "vay nhanh",
  "vay nong",
  "giai ngan",
  "uu dai",
  "mo the tin dung",
  "tin dung den",
  "khuyen mai",
  "giam gia",
  "khuyen mai soc",
  "mua ngay",
  "gia soc",
  "qua tang mien phi",
  "nhan thuong",
  "qua tang",
  "phan thuong",
  "kiem tien",
  "kiem tien online",
  "lam giau",
  "loi nhuan cao",
  "co hoi dau tu",
  "dau tu loi nhuan",
  "viec lam tai nha",
  "viec nhe luong cao",
  "ban hang online",
  "ban gia re",
  "soi keo",
  "ca do",
  "cá cược",
  "link nhan thuong",
  "click ngay",
];

const SPAM_PATTERNS = [
  /\$\d+/g, // Dollar amounts
  /https?:\/\/bit\.ly/gi, // Shortened URLs
  /https?:\/\/tinyurl/gi,
  /click.*here/gi,
  /call.*now/gi,
  /\d{10,}/g, // Long numbers (phone, credit card)
  /FREE/g, // All caps FREE
  /!!+/g, // Multiple exclamation marks
];

class SpamClassifier {
  constructor() {
    this.classifier = new natural.BayesClassifier();
    this.trainClassifier();
  }

  trainClassifier() {
    // Training data - spam messages
    const spamSamples = [
      "Congratulations! You won $1000000! Click here to claim",
      "FREE OFFER! Limited time only! Act now!!!",
      "Work from home and earn $5000 per week",
      "Your account has been compromised. Click this link immediately",
      "Hot singles in your area waiting for you",
      "Get rich quick with this amazing opportunity",
      "Buy now and get 90% discount!!!",
      "Claim your prize now before it expires",
      "You have been selected for a special offer",
      "Lose 30 pounds in 30 days guaranteed",
      // ⚠ SPAM TIẾNG VIỆT
      "Vay tiền nhanh không cần thế chấp",
      "Ưu đãi lớn chỉ hôm nay",
      "Mở thẻ tín dụng nhận quà ngay",
      "Click ngay để nhận thưởng",
      "Cơ hội đầu tư lợi nhuận cao",
      "Khuyến mãi sốc giảm giá 50%",
      "Thu nhập 20 triệu một tháng làm tại nhà",
      "Mua ngay giảm giá cực sốc",
      "Vay nóng giải ngân trong ngày",
      "Nhận thưởng miễn phí chỉ cần đăng ký",
      "Đầu tư lợi nhuận cao rủi ro thấp",
      "Giảm giá 70% chỉ hôm nay",
      "Kiếm tiền online mỗi ngày cực dễ",
      "Cần vay gấp liên hệ ngay",
      "Bạn trúng thưởng phần quà giá trị",
    ];

    // Training data - ham (non-spam) messages
    const hamSamples = [
      "Hey, how are you doing today?",
      "Can we meet for lunch tomorrow?",
      "Thanks for your help with the project",
      "I will send you the documents shortly",
      "Happy birthday! Hope you have a great day",
      "What time is the meeting?",
      "I love this weather",
      "Did you see the game last night?",
      "Let me know when you are free",
      "Great work on the presentation",
      // ✔ HAM TIẾNG VIỆT (tin nhắn bình thường)
      "Chào bạn, hôm nay bạn thế nào?",
      "Khi nào bạn rảnh thì gọi mình nhé",
      "Bạn ăn cơm chưa?",
      "Nhớ gửi mình tài liệu nhé",
      "Tối nay đi chơi không?",
      "Mai họp lúc mấy giờ?",
      "Mình đang trên đường đến",
      "Hẹn gặp bạn chiều nay",
      "Mình sẽ gửi bạn file sau",
      "Thời tiết hôm nay đẹp quá",
      "Bạn đang làm gì vậy?",
      "Ok lát nữa mình gọi lại",
      "Để mình kiểm tra rồi trả lời nhé",
      "Bạn có rảnh cuối tuần này không?",
      "Cảm ơn bạn rất nhiều",
    ];

    spamSamples.forEach((text) => {
      this.classifier.addDocument(text.toLowerCase(), "spam");
    });

    hamSamples.forEach((text) => {
      this.classifier.addDocument(text.toLowerCase(), "ham");
    });

    this.classifier.train();
  }

  calculateSpamScore(content) {
    if (!content || typeof content !== "string") {
      return 0;
    }

    let score = 0;
    const lowerContent = content.toLowerCase();

    // Check for spam keywords
    SPAM_KEYWORDS.forEach((keyword) => {
      if (lowerContent.includes(keyword)) {
        score += 10;
      }
    });

    // Check for spam patterns
    SPAM_PATTERNS.forEach((pattern) => {
      if (pattern.test(content)) {
        score += 15;
      }
    });

    // Check for excessive capitalization
    const upperCaseRatio =
      (content.match(/[A-Z]/g) || []).length / content.length;
    if (upperCaseRatio > 0.5) {
      score += 20;
    }

    // Check for excessive punctuation
    const punctuationCount = (content.match(/[!?]{2,}/g) || []).length;
    score += punctuationCount * 10;

    // Check for URLs
    const urlCount = (content.match(/https?:\/\//g) || []).length;
    score += urlCount * 10;

    // Use NLP to analyze sentiment
    const doc = compromise(content);
    const hasUrgentWords = doc.match("#Urgent").found;
    if (hasUrgentWords) {
      score += 15;
    }

    return Math.min(score, 100);
  }

  isSpam(content) {
    if (
      !content ||
      typeof content !== "string" ||
      content.trim().length === 0
    ) {
      return false;
    }

    // Get Bayes classifier prediction
    const classification = this.classifier.classify(content.toLowerCase());

    // Get spam score
    const spamScore = this.calculateSpamScore(content);

    // Consider spam if:
    // 1. Bayes classifier says spam AND score > 30
    // 2. OR spam score > 50
    const isSpamByBayes = classification === "spam";
    const isSpamByScore = spamScore > 50;

    return (isSpamByBayes && spamScore > 30) || isSpamByScore;
  }

  getSpamDetails(content) {
    const spamScore = this.calculateSpamScore(content);
    const classification = this.classifier.classify(content.toLowerCase());
    const isSpamResult = this.isSpam(content);

    return {
      isSpam: isSpamResult,
      spamScore,
      classification,
      confidence: this.classifier.getClassifications(content.toLowerCase())[0]
        .value,
    };
  }
}

// Singleton instance
const spamClassifier = new SpamClassifier();

module.exports = spamClassifier;
