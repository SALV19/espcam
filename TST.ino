/*
  Rui Santos
  Complete project details at Complete project details at https://RandomNerdTutorials.com/esp32-http-get-post-arduino/

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files.

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include "esp_camera.h"
#include "esp_timer.h"
#include "img_converters.h"
#include "fb_gfx.h"
#include "soc/soc.h" //disable brownout problems
#include "soc/rtc_cntl_reg.h" //disable brownout problems
#include "driver/gpio.h"

const char* ssid = "iPhone de Santiago";
const char* password = "santiald";
const char* url = "/upload";

//Your Domain name with URL path or IP address with path
String serverName = "https://espcam-08k4.onrender.com";

unsigned long lastTime = 0;
unsigned long timerDelay = 5000;

#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22  

camera_fb_t * fb = NULL;
size_t _jpg_buf_len = 0;
uint8_t * _jpg_buf = NULL;
uint8_t state = 0;

esp_err_t init_camera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;

  // parameters for image quality and size
  config.frame_size = FRAMESIZE_VGA; // FRAMESIZE_ + QVGA|CIF|VGA|SVGA|XGA|SXGA|UXGA
  config.jpeg_quality = 15; //10-63 lower number means higher quality
  config.fb_count = 2;
  
  
  // Camera init
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("camera init FAIL: 0x%x", err);
    return err;
  }
  sensor_t * s = esp_camera_sensor_get();
  s->set_framesize(s, FRAMESIZE_VGA);
  Serial.println("camera init OK");
  return ESP_OK;
};

void init_wifi() {
  WiFi.begin(ssid, password);
  Serial.println("Connecting");
  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Connected to WiFi network with IP Address: ");
  Serial.println(WiFi.localIP());
}

void setup() {
  Serial.begin(115200); 

  init_camera();
  init_wifi();
  
 
  Serial.println("Timer set to 5 seconds (timerDelay variable), it will take 5 seconds before publishing the first reading.");

}

void loop() {
  //Send an HTTP POST request every 10 minutes
  if ((millis() - lastTime) > timerDelay) {
    //Check WiFi connection status
    if(WiFi.status()== WL_CONNECTED){
      HTTPClient http;

      String serverPath = serverName + url;
      
      http.begin(serverPath.c_str());
      http.addHeader("Content-Type", "image/jpeg");

      
      // Send HTTP GET request
      // String httpRequestData = "ESP vale pa pura verga";   
      camera_fb_t *fb = esp_camera_fb_get();
        if (!fb) {
          Serial.println("img capture failed");
          esp_camera_fb_return(fb);
          ESP.restart();
        }
        else {
          
          int httpResponseCode = http.POST(fb->buf, fb->len);
          if (httpResponseCode>0) {
            Serial.print("HTTP Response code: ");
            Serial.println(httpResponseCode);
            String payload = http.getString();
            Serial.println(payload);
          }
          else {
            Serial.print("Error code: ");
            Serial.println(httpResponseCode);
            http.end();
          }
        }         
      // Free resources
    }
    else {
      Serial.println("WiFi Disconnected");
    }
    lastTime = millis();
  }
}
