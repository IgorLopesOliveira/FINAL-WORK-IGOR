# SPARX - Smart Punch Detection System

SPARX is a sensor-driven punching bag system that detects and identifies different boxing punches in real time using Velostat sensors and an ESP32 microcontroller. It sends punch data via WiFi to a local Node.js server for real-time feedback and visualization in a browser interface.

---

## 🔍 Description

This project was developed as part of a final graduation assignment focused on smart physical training tools. By using four Velostat pressure sensors connected to an ESP32, SPARX identifies punch types (Right Hook, Left Hook, Jab, Cross, and Uppercut). It processes the analog sensor data and communicates punch events to a web interface via HTTP POST requests and real-time sockets.

---

## 🚀 Getting Started

### 📦 Dependencies

#### Hardware
- ESP32 Dev Board
- 4x Velostat pressure sensors
- Resistors (100 - 200k Ω range recommended)
- Wires, solder, optional sleeve housing
- Local WiFi network or hotspot

#### Software
- [Arduino IDE](https://www.arduino.cc/en/software)
- [Node.js](https://nodejs.org/)
- [Visual Studio Code](https://code.visualstudio.com/)
- NPM packages: `express`, `http`, `socket.io`, `body-parser`

---

### 🔧 Installing

1. **Clone this repository:**
   
   git clone [https://github.com/yourusername/SPARX](https://github.com/IgorLopesOliveira/FINAL-WORK-IGOR.git)
   cd client
   
Install Node dependencies:

npm install

Upload Arduino sketch:

Open sparx_punch_detection.ino in Arduino IDE.

Update WiFi SSID & password.

Connect and upload to your ESP32.

Adjust wiring:

Velostat sensors connect to GPIO pins (e.g. 34, 35, 32, 33).

Share 3.3V and GND.

Use analogRead pins only.

▶️ Executing Program
🔌 Start the Node server:

node index.js
📲 Run the ESP32:
Ensure it connects to the same WiFi network as your computer.

Check Serial Monitor for confirmation and punch logs.

🌐 View the interface:
Open your browser at:

arduino

http://localhost:3000
🆘 Help
WiFi fails to connect?

Check your SSID and password.

Make sure you're not connected to a school or restricted network.

POST status: -1?

Likely WiFi is connected but the server is not reachable.

Ensure your laptop IP matches the ESP32’s serverURL.

4095 value stuck?

The pin might be floating or not grounded properly.

Try a different analog-capable pin or increase resistor value.

👨‍💻 Authors
Igor Lopes Oliveira
@lpsigorr

📈 Version History
0.2

Added support for multiple punch types

Improved WiFi stability and payload handling

0.1

Initial prototype

Basic Velostat sensor reading and single punch detection

📜 License
This project is licensed under the IGOR LOPES OLIVEIRA License


---

This project software was mainly made with the help of Copiltot
