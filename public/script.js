const socket = io();
const punchList = document.getElementById("punchList");

socket.on("punch", (punch) => {
  const li = document.createElement("li");
  li.textContent = punch;
  punchList.appendChild(li);
});