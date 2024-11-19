import {Request, Response} from "express";
import viewRoutes from "./routes/view";
import {Server} from "socket.io"

const express = require("express");
const path = require("path");
const http = require("http");
const bodyParser = require('body-parser');
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for testing. You can replace this with specific URLs later.
    methods: ["GET", "POST"]
  }
})

// Set view engine
app.set("view engine", "ejs");

// Use path.join to set the views directory
app.set("views", path.join(__dirname, "../../frontend"));
app.get("/", viewRoutes);

app.get('/hi', (req: Request, res: Response) => {
  res.send('Hello World'); // Respuesta al cliente
});

app.use(bodyParser.raw({ type: 'image/jpeg', limit: '10mb' }));

app.post('/upload', (req: Request, res: Response) => {
  const imageBuffer = Buffer.from(req.body); // Convert to Buffer

  // Save the image (optional)
  fs.writeFile('received_image.jpg', imageBuffer, (err: Error) => {
    if (err) {
      return res.status(500).send('Error saving image');
    }
    console.log('Image received and saved successfully');
  });

  // Broadcast the image to all connected clients
  io.emit('newImage', imageBuffer.toString('base64'));

  res.send('Image received successfully');
});

// WebSocket para recibir la imagen
io.on("connection", (socket: any) => {
  console.log("A user connected");

  socket.on("frame", (frameData: any) => {
    socket.broadcast.emit("frame", frameData);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(process.env.SERVER_PORT, () => {
  console.log("Server is running on http://localhost:" + process.env.SERVER_PORT);
});


