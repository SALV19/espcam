const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
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
    // This assumes the model expects normalized RGB values
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

// Run the function
async function main() {
  const imagePath = "../uploads/test_img.jpg"; // Replace with your image path
  
  if (fs.existsSync(imagePath)) {
    try {
      const features = await extractImageData(imagePath);
      
      // Convert features array to comma-separated string
      const featuresString = features.join(',');
      
      // Save features to a temporary file
      const tempFilePath = './temp_features.txt';
      fs.writeFileSync(tempFilePath, featuresString);
      
      // Run the classifier with the features file
      const command = `node run-impulse.js ${tempFilePath}`;
      
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing script: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`Script stderr: ${stderr}`);
          return;
        }
        console.log(`Script output:\n${stdout}`);
        
        // Clean up temporary file
        fs.unlinkSync(tempFilePath);
      });
    } catch (error) {
      console.error("Failed to process image:", error);
    }
  } else {
    console.error("Image file not found:", imagePath);
  }
}

main();