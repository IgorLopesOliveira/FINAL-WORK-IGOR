const socket = io();

const punchDisplay = document.getElementById("punch");
const countDisplay = document.getElementById("count");
const axDisplay = document.getElementById("ax");
const ayDisplay = document.getElementById("ay");

let totalPunches = 0;
let lastPunch = "";
let lastTime = 0;

socket.on("punch", (data) => {
  if (!data || !data.type) return;

  punchDisplay.textContent = data.type;
  axDisplay.textContent = "X-Axis: " + data.ax;
  ayDisplay.textContent = "Y-Axis: " + data.ay;

  const now = Date.now();
  if (data.type !== "Still" && (data.type !== lastPunch || now - lastTime > 500)) {
    totalPunches++;
    countDisplay.textContent = "Total Punches: " + totalPunches;
    lastPunch = data.type;
    lastTime = now;
  }
});
