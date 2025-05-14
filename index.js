const express = require("express");
const SerialPort = require("serialport").SerialPort;
const Readline = require("@serialport/parser-readline").ReadlineParser;
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Change to your port name (check Arduino IDE > Tools > Port)
const port = new SerialPort({ path: "/dev/tty.usbmodem1401", baudRate: 9600 });
const parser = port.pipe(new Readline({ delimiter: "\r\n" }));

parser.on("data", (data) => {
  console.log("Received:", data);
  io.emit("punchData", data); // Send data to frontend
});

app.use(express.static("public")); // Serve frontend from /public folder

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
