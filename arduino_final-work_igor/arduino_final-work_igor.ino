#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "IgorWiFi";
const char* password = "12345678";
const char* serverURL = "http://172.20.10.3:3000/punch";

// Velostat pins
const int pinRight  = 34;
const int pinLeft   = 35;
const int pinFront  = 32;  // Jab & Cross
const int pinTop    = 33;  // Left & Right Uppercut

// Individual thresholds
const int thresholdRight = 4090;
const int thresholdLeft  = 4090;
const int thresholdFront = 4050;  // jab/cross
const int thresholdTop   = 4090;  // uppercuts

unsigned long lastPunchTime = 0;
const unsigned long cooldown = 400;  // ms

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");

  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 20) {
    delay(500);
    Serial.print(".");
    retries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi is connected");
    Serial.print("Local IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ WiFi is NOT connected");
  }
}

void sendPunch(String type) {
  Serial.println("👊 Punch detected: " + type);

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");

    String payload = "{\"type\":\"" + type + "\"}";
    int response = http.POST(payload);

    Serial.print("📨 POST status: ");
    Serial.println(response);
    http.end();
  } else {
    Serial.println("❌ WiFi disconnected during POST");
  }
}

void loop() {
  int valRight = analogRead(pinRight);
  int valLeft  = analogRead(pinLeft);
  int valFront = analogRead(pinFront);
  int valTop   = analogRead(pinTop);

  Serial.print("Right: "); Serial.print(valRight);
  Serial.print(" | Left: "); Serial.print(valLeft);
  Serial.print(" | Front: "); Serial.print(valFront);
  Serial.print(" | Top: "); Serial.println(valTop);

  unsigned long now = millis();
  if (now - lastPunchTime >= cooldown) {
    bool punchDetected = false;

    if (valRight > thresholdRight) {
      sendPunch("Right Hook");
      punchDetected = true;
    }

    if (valLeft > thresholdLeft) {
      sendPunch("Left Hook");
      punchDetected = true;
    }

    if (valFront > thresholdFront) {
      sendPunch("Jab");
      sendPunch("Cross");
      punchDetected = true;
    }

    if (valTop > thresholdTop) {
      sendPunch("Left Uppercut");
      sendPunch("Right Uppercut");
      punchDetected = true;
    }

    if (punchDetected) lastPunchTime = now;
  }

  delay(50);
}
