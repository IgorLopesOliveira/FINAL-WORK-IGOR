const socket = io();

socket.on("punchData", (data) => {
  document.getElementById("value").innerText = `Sensor value: ${data}`;
});
