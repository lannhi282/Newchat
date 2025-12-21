// ✅ File: server/start-servers.js
// Khởi động cả Node.js server và Python spam detector

const { spawn } = require("child_process");
const path = require("path");

console.log("🚀 Starting E-Talk servers...\n");

// 1️⃣ Khởi động Python Spam Detector API
console.log("📍 Starting Python Spam Detector API...");
const pythonProcess = spawn("python", ["spam_detector/api.py"], {
  cwd: __dirname,
  stdio: "inherit",
  shell: true,
});

pythonProcess.on("error", (err) => {
  console.error("❌ Failed to start Python API:", err.message);
  console.error("💡 Make sure Python and dependencies are installed:");
  console.error("   pip install flask flask-cors joblib scikit-learn");
  process.exit(1);
});

// Đợi Python API khởi động (2 giây)
setTimeout(() => {
  console.log("\n📍 Starting Node.js server...\n");

  // 2️⃣ Khởi động Node.js server
  const nodeProcess = spawn("node", ["index.js"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true,
  });

  nodeProcess.on("error", (err) => {
    console.error("❌ Failed to start Node.js server:", err.message);
    pythonProcess.kill();
    process.exit(1);
  });

  // Xử lý tắt server
  process.on("SIGINT", () => {
    console.log("\n\n🛑 Shutting down servers...");
    pythonProcess.kill();
    nodeProcess.kill();
    process.exit(0);
  });
}, 2000);

console.log("\n✅ Servers starting...");
console.log("📌 Python API: http://localhost:5001");
console.log("📌 Node.js API: http://localhost:5000");
console.log("\n💡 Press Ctrl+C to stop all servers\n");
