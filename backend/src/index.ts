import { Request, Response } from "express";
import viewRoutes from "./routes/view";
import path from "path";
import fs from "fs";

const imageRecognition = require("./ubicatec/parse_image");
const express = require("express");
const app = express();

interface UploadResponse {
  success: boolean;
  message: string;
  location?: string;
  error?: string;
}

const UPLOAD_DIR = path.join(__dirname, "/ubicatec"); // Directory to store images

app.use(
  "/scripts",
  express.static(path.join(__dirname, "../../frontend/scripts")),
);

// Ensure the upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

app.get("/whereAmI", (req: Request, res: Response) => {
  try {
    const get = async () => {
      const response = await imageRecognition().then((e: any) => e);
      const startIndex = response.indexOf("'") + 1; // +1 to exclude the start character
      const endIndex = response.indexOf(",", startIndex) - 1;

      const answer = response.substring(startIndex, endIndex);
      console.log(answer);

      // const resObj = JSON.parse(response);
      res.status(200).send(answer);
    };
    get();
  } catch (error) {
    res.status(400).send("error: " + error);
  }
});

app.get("/uploads/:filename", (req: Request, res: Response) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "uploads", filename);

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Error sending file:", err);
      res.status(500).send("Error sending the file");
    }
  });
});

app.get("/audio", function (req: Request, res: Response) {
  const fileId = req.query.id as string; // Asegúrate de que `id` es un string.
  if (!fileId) {
    res.status(400).send("Bad Request: Missing file ID");
    return;
  }

  const filePath = __dirname + "/audio/" + fileId;

  // Verificar si el archivo existe
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.status(404).send("File not found");
      return;
    }

    // Configurar cabeceras adecuadas
    res.setHeader("Content-Type", "audio/mpeg");

    // Crear el stream y manejar errores
    const rstream = fs.createReadStream(filePath);
    rstream.on("error", (streamErr) => {
      console.error("Stream error:", streamErr);
      res.status(500).send("Internal Server Error");
    });

    // Enviar el archivo al cliente
    rstream.pipe(res);
  });
});

app.post(
  "/upload",
  express.raw({ type: "image/jpeg", limit: "10mb" }),
  async (req: Request, res: Response) => {
    try {
      if (!req.body || req.body.length === 0) {
        const response: UploadResponse = {
          success: false,
          message: "No image received",
          error: "Empty request body",
        };
        return res.status(400).json(response);
      }

      console.log("Image received. Size:", req.body.length);
      const imageName = "received_image.jpg";
      const imagePath = path.join(UPLOAD_DIR, imageName);

      // Save the image
      await fs.promises.writeFile(imagePath, req.body);

      try {
        // Process image with image recognition
        const recognitionResult = await imageRecognition();

        // Extract location from recognition result
        const startIndex = recognitionResult.indexOf("'") + 1;
        const endIndex = recognitionResult.indexOf(",", startIndex) - 1;
        const location = recognitionResult.substring(startIndex, endIndex);

        // Prepare response for ESP32
        const response: UploadResponse = {
          success: true,
          message: "Image processed successfully",
          location: location,
        };

        // Send structured response
        res.status(200).json(response);
      } catch (recognitionError) {
        const response: UploadResponse = {
          success: false,
          message: "Image saved but processing failed",
          error: recognitionError.toString(),
        };
        res.status(500).json(response);
      }
    } catch (error) {
      console.error("Error:", error);
      const response: UploadResponse = {
        success: false,
        message: "Error processing the image",
        error: error.toString(),
      };
      res.status(500).json(response);
    }
  },
);

// Endpoint de prueba
app.set("view engine", "ejs");

// Use path.join to set the views directory
app.set("views", path.join(__dirname, "../../frontend/views"));
app.use("/", viewRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server online in: http://localhost:${PORT}`);
});
