const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json()); // ✅ Parse JSON POST bodies
app.use(express.static("public")); // Serve frontend

app.post("/punch", (req, res) => {
  const data = req.body;

  if (!data || !data.type) {
    console.log("❌ Invalid punch data received:", data);
    return res.sendStatus(400);
  }

  console.log("✅ Received punch:", data);
  io.emit("punch", data);  // send full { type, ax } object to frontend
  res.sendStatus(200);
});

server.listen(3000, () => {
  console.log("Server listening on http://localhost:3000");
});
