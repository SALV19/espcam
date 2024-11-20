import {Request, Response} from 'express'
import viewRoutes from './routes/view';
import path from 'path';
import http from 'http';

const WebSocketServer = require('ws');
const express = require('express');
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });


wss.on('connection', (ws: any) => {
  console.log('Client connected via WebSocket');

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});


// Endpoint para recibir imágenes
app.post('/upload', express.raw({ type: 'image/jpeg', limit: '10mb' }), (req: Request, res: Response) => {
  try {
    if (!req.body || req.body.length === 0) {
      return res.status(400).send('No image received');
    }

    console.log('Image received. Size:', req.body.length);

    // Broadcast the image to all connected WebSocket clients
    wss.clients.forEach((client: any) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(req.body); // Send the raw image buffer
      }
    });

    res.status(200).send('Image broadcasted successfully');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error processing the image');
  }
});


// Endpoint de prueba
app.set("view engine", "ejs");

// Use path.join to set the views directory
app.set("views", path.join(__dirname, "../../frontend"));
app.get("/", viewRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});