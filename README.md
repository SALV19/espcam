# Building Identifier for Visually Challenged Individuals  

## Overview  

This project is an assistive technology solution designed to help visually challenged individuals identify campus buildings using an **ESP32-CAM**. By leveraging modern machine learning and web technologies, the system provides real-time feedback to users, making navigation around campuses more accessible and intuitive.

---

## Features  

- **Building Identification**: Uses machine learning models to recognize campus buildings based on images captured by the ESP32-CAM.  
- **Real-time Processing**: Combines edge computing and server communication for quick responses.  
- **User-friendly Interface**: A simple and accessible front-end for interacting with the system.  

---

## Tools and Technologies  

- **ESP32-CAM**: A low-cost development board for capturing and transmitting images.  
- **Express.js**: Backend framework for managing communication between the ESP32-CAM and the server.  
- **Tailwind CSS**: Utility-first CSS framework used to style the front-end interface.  
- **Edge Impulse**: Platform for training and deploying the machine learning model.  
- **Arduino IDE**: Used for programming the ESP32-CAM.  

---

## How It Works  

1. **Image Capture**: The ESP32-CAM captures images of the surrounding area.  
2. **Data Transmission**: The captured image is sent to the server via HTTP requests managed by an Express.js backend, and waits for a response before sending another.  
3. **Machine Learning Inference**: The server processes the image using a pre-trained model deployed via Edge Impulse to identify the building.  
4. **Feedback Delivery**: The result is sent back to the user in a tag, and can play an descriptive audio.

---

## Installation and Setup  

1. **Hardware Setup**  
   - Configure the ESP32-CAM with the appropriate WiFi connection, and server connection.
   - Flash the Arduino code to the ESP32-CAM.  

2. **Server Setup**  
   - Clone this repository.  
   - Install dependencies:  
     ```bash
     npm install
     ```  
   - Start the server:  
     ```bash
     npm run dev
     ```
     Or
     ```bash
     npm run build
     npm run start
     ```

3. **Model Deployment**  
   - Train your model on Edge Impulse using images of campus buildings.  
   - Export the model and integrate it into the backend.  

4. **Front-end**  
   - Customize the interface styled with Tailwind CSS for user accessibility.  

---

## Acknowledgments  

This project was made possible by the following tools and platforms:  
- **Edge Impulse** for enabling rapid machine learning model development.  
- **Express.js** for providing a robust server framework.  
- **Tailwind CSS** for simplifying front-end styling.  
- **Arduino** for making hardware programming seamless.  

---

## Future Improvements  

- Expansion to recognize additional landmarks and provide navigation assistance.  

---

## Authors

Developed by Emilio Santiago López Quiñonez, Kamila Jeannette Martínez Ibarra, Santiago Alducin Villaseñor.  
