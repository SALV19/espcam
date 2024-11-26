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

let isProcessing = false;
let currentResponse: Response | null = null;

app.use(
  "/scripts",
  express.static(path.join(__dirname, "../../frontend/scripts")),
);

// Ensure the upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

app.get("/new_photo", async (req: Request, res: Response) => {
  try {
    if (!isProcessing || !currentResponse) {
      return res.status(400).send("No image waiting to be processed");
    }

    // Enviar respuesta al ESP32 que está esperando
    const uploadResponse: UploadResponse = {
      success: true,
      message: "Image processed successfully",
    };

    currentResponse.status(200).json(uploadResponse);

    // Resetear el estado
    isProcessing = false;
    currentResponse = null;

    // Responder a la llamada whereAmI
    res.status(200).json({
      success: true,
      message: "Free Buffer",
    });
  } catch (error: any) {
    console.error("Error in new_photo:", error);

    if (currentResponse) {
      const uploadResponse: UploadResponse = {
        success: false,
        message: "Error processing the image",
        error: error.toString(),
      };
      currentResponse.status(500).json(uploadResponse);

      isProcessing = false;
      currentResponse = null;
    }

    res.status(500).json({
      success: false,
      message: "Error processing location",
      error: error.toString(),
    });
  }
});

app.get("/whereAmI", async (req: Request, res: Response) => {
  try {
    const response = await imageRecognition();
    const startIndex = response.indexOf("'") + 1;
    const endIndex = response.indexOf(",", startIndex) - 1;
    const location = response.substring(startIndex, endIndex);

    console.log("Location detected:", location);

    res.status(200).send(location);
  } catch (error: any) {
    console.error("Error in whereAmI:", error);
    res.status(500).json({
      success: false,
      message: "Error processing location",
      error: error.toString(),
    });
  }
});

app.get("/uploads/:filename", (req: Request, res: Response) => {
  const filename = "received_image.jpg";
  const filePath = path.join(__dirname, "/ubicatec", filename);

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
  console.log(filePath);

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

      if (isProcessing) {
        const response: UploadResponse = {
          success: false,
          message: "Server is currently processing another image",
          error: "Server busy",
        };
        return res.status(429).json(response);
      }

      isProcessing = true;
      currentResponse = res;

      console.log("Image received. Size:", req.body.length);
      const imageName = "received_image.jpg";
      const imagePath = path.join(UPLOAD_DIR, imageName);

      await fs.promises.writeFile(imagePath, req.body);
      console.log("Image saved, waiting for processing...");

      // No enviamos respuesta aquí - esperaremos a que whereAmI la procese
    } catch (error: any) {
      isProcessing = false;
      currentResponse = null;
      console.error("Error:", error);
      const response: UploadResponse = {
        success: false,
        message: "Error saving the image",
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
