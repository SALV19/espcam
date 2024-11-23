import { Request, Response } from "express";
import viewRoutes from "./routes/view";
import path from "path";
import fs from "fs";

const imageRecognition = require("./ubicatec/parse_image");
const express = require("express");
const app = express();

const UPLOAD_DIR = path.join(__dirname, "/uploads"); // Directory to store images

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

// Endpoint para recibir imágenes
app.post(
  "/upload",
  express.raw({ type: "image/jpeg", limit: "10mb" }),
  (req: Request, res: Response) => {
    try {
      if (!req.body || req.body.length === 0) {
        return res.status(400).send("No image received");
      }

      console.log("Image received. Size:", req.body.length);
      const imageName = "img.jpg";
      const imagePath = path.join(UPLOAD_DIR, imageName);

      // Save the image to the uploads directory
      fs.writeFileSync(imagePath, req.body);
      res.status(200).send("Success!");
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Error processing the image");
    }
  },
);

// Endpoint de prueba
app.set("view engine", "ejs");

// Use path.join to set the views directory
app.set("views", path.join(__dirname, "../../frontend/views"));
app.get("/", viewRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server online in: http://localhost:${PORT}`);
});
