const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// ✅ Allow frontend origin
app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());

// ✅ Setup Socket.IO with CORS config too!
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// 📡 Socket connection
io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);
});

app.post("/punch", (req, res) => {
  const data = req.body;
  if (!data || !data.type) {
    console.log("❌ Invalid punch data:", data);
    return res.sendStatus(400);
  }

  console.log("🥊 Punch received:", data);
  io.emit("punch", data); // 🔁 send to frontend
  res.sendStatus(200);
});

server.listen(3000, () => {
  console.log("🚀 Backend running at http://localhost:3000");
});
