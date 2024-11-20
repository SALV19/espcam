import {Request, Response} from 'express'
import viewRoutes from './routes/view';
import path from 'path';

const express = require('express');
const multer = require('multer');
const app = express();

// Configurar multer para manejar archivos
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get('/hi', (req: any, res: any) => {
  console.log("Hello there");
  res.send("helo");
})
app.post("/test", (req: Request, res: any) => {
  console.log("SUCCESS!!!!");
  console.log(req.body);
  
  res.send(req.body +"!");
})

// Endpoint para recibir imágenes
app.post('/upload', upload.single('image'), (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).send('No se recibió ninguna imagen');
    }
    
    console.log('Imagen recibida. Tamaño:', req.file.size);
    res.status(200).send('Imagen recibida correctamente');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error al procesar la imagen');
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