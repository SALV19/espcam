import {Request, Response} from 'express'

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
app.post("/test", (req: any, res: any) => {
  console.log("SUCCESS!!!!");
  res.send("TEST connection successfully!");
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
app.get('/', (req: any, res: any) => {
  res.send('Servidor funcionando correctamente');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});