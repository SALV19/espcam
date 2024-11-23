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
    console.log("Pixel data:", imageData.data); // Uint8ClampedArray of RGBA values
    console.log("Image width:", imageData.width);
    console.log("Image height:", imageData.height);

    return imageData;
  } catch (error) {
    console.error("Error processing image:", error);
  }
}

// Run the function
const imagePath = "../uploads/test_img.jpg"; // Replace with your image path
if (fs.existsSync(imagePath)) {
  // console.log(extractImageData(imagePath));
  const command = `node run-impulse.js ${extractImageData(imagePath)}`;
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
  });
} else {
  console.error("Image file not found:", imagePath);
}
