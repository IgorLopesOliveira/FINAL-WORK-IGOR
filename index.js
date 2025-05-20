const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const bodyParser = require("body-parser");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(bodyParser.json());
app.use(express.static("public"));

app.post("/punch", (req, res) => {
  const punch = req.body.type;
  console.log("🥊 Punch received:", punch);
  io.emit("punch", punch); // If you also want real-time UI
  res.sendStatus(200);
});

server.listen(3000, () => {
  console.log("🌐 Server listening at http://localhost:3000");
});
