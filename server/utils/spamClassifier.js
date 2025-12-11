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
