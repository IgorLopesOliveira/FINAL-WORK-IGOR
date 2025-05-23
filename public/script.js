const socket = io();

const punchDisplay = document.getElementById("punch");
const countDisplay = document.getElementById("count");
const axDisplay = document.getElementById("ax");
const ayDisplay = document.getElementById("ay");
const azDisplay = document.getElementById("az");


let totalPunches = 0;
let lastPunch = "";
let lastTime = 0;

socket.on("punch", (data) => {
  if (!data || !data.type) return;

  punchDisplay.textContent = data.type;
  axDisplay.textContent = "X-Axis: " + data.ax;
  ayDisplay.textContent = "Y-Axis: " + data.ay;
  azDisplay.textContent = "Z-Axis: " + data.az;

  const now = Date.now();
  if (data.type !== "Still" && (data.type !== lastPunch || now - lastTime > 500)) {
    totalPunches++;
    countDisplay.textContent = "Total Punches: " + totalPunches;
    lastPunch = data.type;
    lastTime = now;
  }
});
