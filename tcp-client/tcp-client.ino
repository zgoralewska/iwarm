#include <Ethernet.h>
#include <SPI.h>
#include <dht.h>;

#define DHT22_PIN 2

byte mac[] = { 
  0x90, 0xA2, 0XDA, 0X00, 0XF8, 0X06 };
IPAddress ip(192,168,1,20);
char hostname[] = "zgoralewska.me";
int port = 7700;
int counter = 0;
String houseId = "#abcd";

unsigned long lastConnectionTime = 0;             
const unsigned long postingInterval = 30000; 
boolean orderFlag = false;
char orderTxt = (char) 0;

int ledPin = 9; 
dht DHT;

EthernetClient client;

//--------------------------------------------------------------------------

void setup() {
  Serial.begin(9600);
  Serial.println("Zaczynamy");


  if (Ethernet.begin(mac) == 0) {
      Serial.println("Failed to configure Ethernet using DHCP");
      // no point in carrying on, so do nothing forevermore:
      // try to congifure using IP address instead of DHCP:
      Ethernet.begin(mac, ip);
  }
  Serial.println("connecting...");
  delay(3000);
  
  pinMode(ledPin, OUTPUT);
  connectToServer();
}

//--------------------------------------------------------------------------    
void loop() {
  if (client.connected()) {
     while(client.available()){
       orderFlag = true;
       
       orderTxt = client.read();
       Serial.print(orderTxt);
     }
     
     if(orderFlag){
       Serial.println();
       getOrder(orderTxt);
     }
      
      if (millis() - lastConnectionTime > postingInterval) {
        postTemperature();
        lastConnectionTime = millis();
      }
  }
  else {
    Serial.println();
    Serial.println("disconnecting.");
    client.stop();
    client.flush();
    
    delay(1000);
    connectToServer();
  }
  delay(1000);
}

void connectToServer(){
  if (client.connect(hostname, port)) {
      Serial.println("connected");
      //register
      client.print("Hallo houseId="+houseId);
    } else {
      Serial.println("connection failed");
    }
}

void postTemperature()
{
  int chk = DHT.read22(DHT22_PIN);
  float temperatureC = DHT.temperature;
  String result = "Temp";
  
  result += " temp=" + String(temperatureC) + "|" + "houseId=" + houseId;
  client.print(result);
}

void getOrder(char txt){ 
  int order = (int)txt - 48;
  
  digitalWrite(ledPin, order);
  orderFlag = false;
  orderTxt = (char) 0;
  
  sendOrderResult(txt);
}

void sendOrderResult(char orderState){
  int actualState = digitalRead(ledPin);
  String result = "Order";
  
  result += " before=" + String(orderState) + "|" + "now=" + String(actualState)
            + "|" + "houseId=" + houseId;
  client.print(result);
}




