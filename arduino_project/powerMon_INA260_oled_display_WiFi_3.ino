#include <Adafruit_INA260.h>
#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <WiFi101.h>


float battery_voltage  = 0.0;
float battery_charging_current  = 0.0;
float battery_discharging_current  = 0.0;
float battery_charging_power = 0.0;
float battery_discharging_power = 0.0;



//WIFI SETUP for home
char ssid[] = "SK_WiFi8E51";
char pass[] = "1306000177";           // your network password (use for WPA, or use as key for WEP)


WiFiClient client;
int status = WL_IDLE_STATUS;

//SERVER ADDRESS
IPAddress influxDB_Keti(203,254,173,175);


//InfluxDB Sensors ?
String SensorForInfluxdb = "sean_home";

//InfluxDB Databases
String db_keti = "COT_DATA";

// InfluxDB Header
String headerForInfluxdb = "Content-Type:application/x-www-form-urlencoded\nContent-Length: ";

const unsigned long timeout = 10L * 1000L;
int responseCode = 0;

int loop_cnt = 6;
int networkFailCount = 0;

#define VBATPIN A7
#define 3_5_CONVERTOR_PIN 10
#define UPPER_VOLTAGE 4.18
#define LOWER_VOLTAGE 3.80
int output_on = 0;

void setup() {
  Serial.begin(115200);
  // Wait until serial port is opened
  //while (!Serial) { delay(10); }
 
  pinMode(3_5_CONVERTOR_PIN,OUTPUT); // pin setup for 3.7 -> 5V converter enable/disable control
 
  Serial.println("Adafruit INA260 Test");
 

  WiFi.setPins(8, 7, 4, 2);
  if (WiFi.status() == WL_NO_SHIELD) {
    Serial.println("WiFi shield not present");
    while (true);
  }

  connectWiFi();
  printWiFiStatus();

  delay(3*1000);

}



void loop() {


  if(loop_cnt == 6)
  {
   // send_to_influxDB(influxDB_Home,db_home);
    send_to_influxDB(influxDB_Keti,db_keti);
    loop_cnt = 0;  
	
	float vbat = get_battery_voltage();

	// if(vbat > UPPER_VOLTAGE && output == 0)
	// {
	// 	turn_on_overflow_storage();
	// 	output_on = 1;
	// }
	// else if(vbat < LOWER_VOLTAGE && output == 1)
	// {
	// 	turn_off_overflow_storage();
	// 	output_on = 0;
	// }
	
  // }

  loop_cnt++;
}


void turn_on_overflow_storage()
{
	digitalWrite(3_5_CONVERTOR_PIN,HIGH);
}

void turn_off_overflow_storage()
{
	digitalWrite(3_5_CONVERTOR_PIN,LOW);
}

float get_battery_voltage()
{  
  float measuredvbat = analogRead(VBATPIN);
  measuredvbat *= 2;    // we divided by 2, so multiply back
  measuredvbat *= 3.3;  // Multiply by 3.3V, our reference voltage
  measuredvbat /= 1024; // convert to voltage
  Serial.print("VBat: " , measuredvbat, " v"); //Serial.print(measuredvbat);Serial.println(" v");
  return measuredvbat;
 // display_battery_voltage(measuredvbat);
}


void get_power_info()
{
  display.clearDisplay();
  from_solar_panel_voltage  = ina260_from_solar_panel.readBusVoltage()/1000;
  from_solar_panel_current  = ina260_from_solar_panel.readCurrent()/1000;
  from_solar_panel_power    = ina260_from_solar_panel.readPower()/1000;

  from_solar_charger_voltage  = ina260_from_solar_charger.readBusVoltage()/1000;
  from_solar_charger_current  = ina260_from_solar_charger.readCurrent()/1000;
  from_solar_charger_power    = ina260_from_solar_charger.readPower()/1000;
  
  to_load_voltage = ina260_to_load.readBusVoltage()/1000;
  to_load_current = ina260_to_load.readCurrent()/1000;
  to_load_power   = ina260_to_load.readPower()/1000;

  if(from_solar_panel_current < 0 &&  from_solar_panel_current > -0.01)
  {
    from_solar_panel_current = 0.0;
  }
  if(from_solar_charger_current < 0 &&  from_solar_charger_current > -0.01)
  {
    from_solar_charger_current = 0.0;
  }
  if(to_load_current < 0 &&  to_load_current > -0.01)
  {
    to_load_current = 0.0;
  }

  battery_voltage = to_load_voltage;
  
  if(from_solar_charger_current - to_load_current >= 0)
  {
    battery_charging_current = from_solar_charger_current - to_load_current;  
    battery_charging_power = from_solar_charger_power - to_load_power;  
  }
  else
  {
    battery_charging_current = 0;
    battery_charging_power = 0;
  }
  
  if(to_load_current - from_solar_charger_current >= 0)
  {
    battery_discharging_current = to_load_current - from_solar_charger_current;  
    battery_discharging_power   = to_load_power - from_solar_charger_power;  
  }
  else
  {
    battery_discharging_current = 0;
    battery_discharging_power = 0;
  }


  
  Serial.print("S: ");   
  Serial.print(from_solar_panel_voltage,2);   Serial.print(" V ");
  Serial.print(from_solar_panel_current,2);   Serial.println(" A ");

  Serial.print("C: ");   
  Serial.print(from_solar_charger_voltage,2);   Serial.print(" V ");
  Serial.print(from_solar_charger_current,2);   Serial.println(" A ");

  Serial.print("B: ");   
  Serial.print(battery_charging_current,2);     Serial.print(" A ");
  Serial.print(battery_discharging_current,2);  Serial.println(" A ");
  
  Serial.print("L: ");
  Serial.print(to_load_voltage,2);   Serial.print(" V ");
  Serial.print(to_load_current,2);   Serial.println(" A ");

  Serial.print("P: ");
  Serial.print(from_solar_panel_power,2);   Serial.print(" W ");
  Serial.print(battery_charging_power,2);   Serial.print(" W ");
  Serial.print(battery_discharging_power,2);   Serial.print(" W ");
  Serial.print(to_load_power,2);   Serial.println(" W ");
  Serial.println();
  Serial.println();

  display.setTextSize(2);
  display.clearDisplay();
  display.setCursor(0,0);
  display.println("Solar:");
  display.print(from_solar_panel_voltage); display.print(" "); 
  display.print(from_solar_panel_current); //display.print(" A"); 
  display.display(); // actually display all of the above
  delay(3300);

  display.clearDisplay();
  display.setCursor(0,0);
  display.print("Bat: "); display.println(battery_voltage);
  display.print(battery_charging_current);    display.print(" "); 
  display.print(battery_discharging_current); //display.print(" A"); 
  display.display(); // actually display all of the above
  delay(3300);

  display.clearDisplay();
  display.setCursor(0,0);
  display.println("Load: ");
  display.print(to_load_current); display.print(" A  "); 
  display.display(); // actually display all of the above
  delay(3300);
}



void send_to_influxDB(IPAddress serverIP, String db_name)
{
  Serial.print("Send data to ");Serial.println(serverIP);
  String textBodyForInflux_solar_panel_voltage  = makeTextForInflux("solar_voltage");  
  String textBodyForInflux_solar_panel_current  = makeTextForInflux("solar_current");
  
  String textBodyForInflux_charging_current     = makeTextForInflux("charging_current");
  String textBodyForInflux_discharging_current  = makeTextForInflux("discharging_current");  

  String textBodyForInflux_battery_voltage      = makeTextForInflux("battery_voltage");
  String textBodyForInflux_load_current         = makeTextForInflux("load_current");

  String textBodyForInflux_solar_power          = makeTextForInflux("solar_power");
  String textBodyForInflux_charging_power       = makeTextForInflux("charging_power");
  String textBodyForInflux_discharging_power    = makeTextForInflux("discharging_power");
  String textBodyForInflux_load_power           = makeTextForInflux("load_power");
  
  responseCode = httpPostRequest(serverIP, 8086, "/write?db="+db_name, headerForInfluxdb, textBodyForInflux_solar_panel_voltage);
  Serial.println(responseCode);
  responseCode = httpPostRequest(serverIP, 8086, "/write?db="+db_name, headerForInfluxdb, textBodyForInflux_solar_panel_current);
  Serial.println(responseCode);
  responseCode = httpPostRequest(serverIP, 8086, "/write?db="+db_name, headerForInfluxdb, textBodyForInflux_charging_current);
  Serial.println(responseCode);
  responseCode = httpPostRequest(serverIP, 8086, "/write?db="+db_name, headerForInfluxdb, textBodyForInflux_discharging_current);
  Serial.println(responseCode);  
  responseCode = httpPostRequest(serverIP, 8086, "/write?db="+db_name, headerForInfluxdb, textBodyForInflux_battery_voltage);
  Serial.println(responseCode);
  responseCode = httpPostRequest(serverIP, 8086, "/write?db="+db_name, headerForInfluxdb, textBodyForInflux_load_current);
  Serial.println(responseCode);

  responseCode = httpPostRequest(serverIP, 8086, "/write?db="+db_name, headerForInfluxdb, textBodyForInflux_solar_power);
  Serial.println(responseCode);
  responseCode = httpPostRequest(serverIP, 8086, "/write?db="+db_name, headerForInfluxdb, textBodyForInflux_charging_power);
  Serial.println(responseCode);
  responseCode = httpPostRequest(serverIP, 8086, "/write?db="+db_name, headerForInfluxdb, textBodyForInflux_discharging_power);
  Serial.println(responseCode);
  responseCode = httpPostRequest(serverIP, 8086, "/write?db="+db_name, headerForInfluxdb, textBodyForInflux_load_power);
  Serial.println(responseCode);
  
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
  Serial.println(responseCode); 
  Serial.println();
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


String makeTextForInflux(String sensor){
  String text = sensor + ",sensorID=" + SensorForInfluxdb + " value=";
  
  // form = measurement,tag=... value=...
  if (sensor.equals("solar_voltage")) {
    text += String(from_solar_panel_voltage,2);
  } else if (sensor.equals("solar_current")) {
    text += String(from_solar_panel_current,2);
  } else if (sensor.equals("charging_current")) {
    text += String(battery_charging_current,2);
  } else if (sensor.equals("discharging_current")) {
    text += String(battery_discharging_current,2);
  } else if (sensor.equals("battery_voltage")) {
    text += String(battery_voltage,2);
  } else if (sensor.equals("load_current")) {
    text += String(to_load_current,2);
  } else if (sensor.equals("solar_power")) {
    text += String(from_solar_panel_power,2);
  } else if (sensor.equals("charging_power")) {
    text += String(battery_charging_power,2);
  } else if (sensor.equals("discharging_power")) {
    text += String(battery_discharging_power,2);
  } else if (sensor.equals("load_power")) {
    text += String(to_load_power,2);
  } else {
    Serial.println("makeTextForInflux failed");
  }

  return text;
  
}

void printWiFiStatus() {
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());

  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);

  long rssi = WiFi.RSSI();
  Serial.print("signal strength (RSSI): ");
  Serial.print(rssi);
  Serial.println(" dBm");
}
