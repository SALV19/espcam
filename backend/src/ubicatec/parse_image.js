const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

async function extractImageData(imagePath) {
  try {
    // Load the image file
    const img = await loadImage(imagePath);
    
    // Create a canvas and set its dimensions to match the image
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext("2d");
    
    // Draw the image onto the canvas
    ctx.drawImage(img, 0, 0);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Convert RGBA data to the format expected by the model
    const features = [];
    for (let i = 0; i < imageData.data.length; i += 4) {
      // Convert RGB values to normalized floats (0-1)
      features.push(imageData.data[i] / 255.0);     // R
      features.push(imageData.data[i + 1] / 255.0); // G
      features.push(imageData.data[i + 2] / 255.0); // B
      // We skip the alpha channel (i + 3)
    }
    
    return features;
  } catch (error) {
    console.error("Error processing image:", error);
    throw error;
  }
}

async function main() {
  // Rutas basadas en la estructura actual del proyecto
  const imagePath = path.join(__dirname, 'received_image.jpg');
  const runImpulsePath = path.join(__dirname, 'run-impulse.js');
  const featuresPath = path.join(__dirname, 'raw_features.txt');
  
  if (fs.existsSync(imagePath)) {
    try {
      console.log('Processing image...');
      const features = await extractImageData(imagePath);
      
      // Convert features array to comma-separated string
      const featuresString = features.join(',');
      
      // Save features to raw_features.txt
      fs.writeFileSync(featuresPath, featuresString);
      console.log('Features saved to raw_features.txt');
      
      // Run the classifier with the features file
      const command = `node "${runImpulsePath}" "${featuresPath}"`;
      
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing classifier: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`Classifier stderr: ${stderr}`);
          return;
        }
        console.log(`Classifier output:\n${stdout}`);
      });
    } catch (error) {
      console.error("Failed to process image:", error);
    }
  } else {
    console.error("Image file not found:", imagePath);
  }
}

main();