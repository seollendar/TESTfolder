
#define VBATPIN A7
#include <SPI.h>
#include <WiFi101.h>


char ssid[] = "CoTLab01_Device_2G";
char pass[] = "badacafe00";       // your network password (use for WPA, or use as key for WEP)
WiFiClient client;
int status = WL_IDLE_STATUS;     // the WiFi radio's status

//SERVER ADDRESS
IPAddress influxDB_Keti(203,253,128,166); //bada
//IPAddress influxDB_Keti(203,254,173,175);

//InfluxDB tag key
String SensorForInfluxdb = "adafruit";

//InfluxDB Databases
String db_keti = "COT_DATA"; //bada
//String db_keti = "arduino";

// InfluxDB Header
String headerForInfluxdb = "Content-Type:application/x-www-form-urlencoded\nContent-Length: ";

const unsigned long timeout = 10L * 1000L;
int responseCode = 0;

int loop_cnt = 6;
int networkFailCount = 0;

#define UPPER_VOLTAGE 4.18
#define LOWER_VOLTAGE 3.80
int output_on = 0;

float vbat = 0.0;
long rssi = 0.0;


void setup() {
   //Configure pins for Adafruit ATWINC1500 Feather
  WiFi.setPins(8,7,4,2);
  //Initialize serial and wait for port to open:
  Serial.begin(9600);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }

  // check for the presence of the shield:
  if (WiFi.status() == WL_NO_SHIELD) {
    Serial.println("WiFi shield not present");
    // don't continue:
    while (true);
  }

  connectWiFi();
  Serial.println();
  // you're connected now, so print out the data:
  Serial.println("You're connected to the network");
  Serial.println();
  printCurrentNet();
  printWiFiData();

  delay(3*1000);
}

void loop() {
  // check the network connection once every 10 seconds:
  delay(30000);
  if(loop_cnt == 6){
    Serial.println("send_to_influxDB");
    vbat = get_battery_voltage();
    rssi = WiFi.RSSI();
    send_to_influxDB(influxDB_Keti,db_keti);
    loop_cnt = 0;  
  
  }

  loop_cnt++;

}

void connectWiFi()
{
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print("Attempting to connect to SSID: ");
    Serial.println(ssid);
    status = WiFi.begin(ssid, pass);
    Serial.print("WiFi.begin status: ");
    Serial.print(status);
    Serial.print(" (WL_CONNECTED: ");
    Serial.print(WL_CONNECTED);
    Serial.print(")");
    delay(5000);
  }
}

void printWiFiData() {
  // print your WiFi shield's IP address:
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);

  // print your MAC address:
  byte mac[6];
  WiFi.macAddress(mac);
  Serial.print("MAC address: ");
  printMacAddress(mac);
  Serial.println();

}

void printCurrentNet() {
  // print the SSID of the network you're attached to:
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());

  // print the MAC address of the router you're attached to:
  byte bssid[6];
  WiFi.BSSID(bssid);
  Serial.print("BSSID: ");
  printMacAddress(bssid);

  // print the received signal strength:
  long rssi = WiFi.RSSI();
  Serial.print("signal strength (RSSI):");
  Serial.print(rssi); 
  Serial.println(" dBm");

  // print the encryption type:
  byte encryption = WiFi.encryptionType();
  Serial.print("Encryption Type:");
  Serial.println(encryption, HEX);
  Serial.println();
}

void printMacAddress(byte mac[]) {
  for (int i = 5; i >= 0; i--) {
    if (mac[i] < 16) {
      Serial.print("0");
    }
    Serial.print(mac[i], HEX);
    if (i > 0) {
      Serial.print(":");
    }
  }
  Serial.println();
}


float get_battery_voltage()
{  
  float measuredvbat = analogRead(VBATPIN);
  measuredvbat *= 2;    // we divided by 2, so multiply back
  measuredvbat *= 3.3;  // Multiply by 3.3V, our reference voltage
  measuredvbat /= 1024; // convert to voltage
  Serial.print("VBat: " ); Serial.print(measuredvbat); Serial.println(" v");
  
  return measuredvbat;
}


void send_to_influxDB(IPAddress serverIP, String db_name)
{
  Serial.print("Send data to ");Serial.println(serverIP);
  
  String textBodyForInflux_battery_voltage = makeTextForInflux("vbat");
  String textBodyForInflux_signal_strength = makeTextForInflux("rssi");

  responseCode = httpPostRequest(serverIP, 8086, "/write?db="+db_name, headerForInfluxdb, textBodyForInflux_battery_voltage);
  //Serial.println(responseCode);
  responseCode = httpPostRequest(serverIP, 8086, "/write?db="+db_name, headerForInfluxdb, textBodyForInflux_signal_strength);
  //Serial.println(responseCode);

  
  if(responseCode == 404 || responseCode == 408)
  {
    networkFailCount++;
    if(networkFailCount >= 5)
    {
      connectWiFi();
    }
  }
  else
  {
    networkFailCount = 0;
  }
  //Serial.println(responseCode); 

}


String makeTextForInflux(String sensor){
  // form = measurement,tag=... value=...
  String text = sensor + ",sensorID=" + SensorForInfluxdb + " value=";
 
  if (sensor.equals("vbat")) {
    text += String(vbat,2);
  } else if (sensor.equals("rssi")) {
    text += String(rssi,2);
  } else {
    Serial.println("makeTextForInflux failed");
  }

  return text;
}


int httpPostRequest(IPAddress serverIP, int portNum, String url, String header, String body)
{
  int statusCode = 408;  // http timeout status code
  String readBuffer = "";
  unsigned long setTime = 0;
    
  if (client.connect(serverIP, portNum)) {
    Serial.println("connection success");
   
    client.print("POST ");  //"POST /CoT/base HTTP/1.1"
    client.print(url);
    client.println(" HTTP/1.1");

    client.print("Host: ");
    client.print(serverIP);
    client.print(":");
    client.println(portNum);

    client.print(header);
    client.println(body.length());
    client.println();
    client.println(body);

    setTime = millis();
    while ((millis() - setTime) < timeout) {
      while (client.available()) {
        char c = client.read();
        readBuffer += c;
      }
      
      if (readBuffer.length() > 0) {
        statusCode = readBuffer.substring(9, 12).toInt();
        break;
      }
    }
  } else {
    statusCode = 404;  // connection fail, 404 not found
  }

  Serial.print(body + "\n");
  
  client.stop();
  return statusCode;
}
