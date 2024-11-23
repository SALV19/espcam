const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

function rgbToHex(r, g, b) {
  const hex = (r << 16) | (g << 8) | b;
  return "0x" + hex.toString(16).padStart(6, "0");
}

async function extractImageFeatures(imagePath) {
  try {
    // Load the image
    const img = await loadImage(imagePath);
    console.log("Original image dimensions:", img.width, "x", img.height);

    // Calculate dimensions that maintain aspect ratio
    const TARGET_SIZE = 96;
    let width = TARGET_SIZE;
    let height = TARGET_SIZE;
    let offsetX = 0;
    let offsetY = 0;

    if (img.width > img.height) {
      height = Math.round((TARGET_SIZE * img.height) / img.width);
      offsetY = Math.floor((TARGET_SIZE - height) / 2);
    } else {
      width = Math.round((TARGET_SIZE * img.width) / img.height);
      offsetX = Math.floor((TARGET_SIZE - width) / 2);
    }

    // Create temporary canvas for initial resize
    const tempCanvas = createCanvas(width, height);
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.imageSmoothingEnabled = true;
    tempCtx.imageSmoothingQuality = "high";
    tempCtx.drawImage(img, 0, 0, width, height);

    // Create final canvas
    const finalCanvas = createCanvas(TARGET_SIZE, TARGET_SIZE);
    const finalCtx = finalCanvas.getContext("2d");

    // Fill with black
    finalCtx.fillStyle = "#000000";
    finalCtx.fillRect(0, 0, TARGET_SIZE, TARGET_SIZE);

    // Draw resized image centered
    finalCtx.drawImage(tempCanvas, offsetX, offsetY);

    // Get image data
    const imageData = finalCtx.getImageData(0, 0, TARGET_SIZE, TARGET_SIZE);

    // Save processed image for verification
    fs.writeFileSync("processed.jpg", finalCanvas.toBuffer("image/jpeg"));
    console.log("Saved processed image for verification");

    // Analyze pixel distribution
    let minR = 255,
      minG = 255,
      minB = 255;
    let maxR = 0,
      maxG = 0,
      maxB = 0;
    let avgR = 0,
      avgG = 0,
      avgB = 0;

    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];

      minR = Math.min(minR, r);
      minG = Math.min(minG, g);
      minB = Math.min(minB, b);

      maxR = Math.max(maxR, r);
      maxG = Math.max(maxG, g);
      maxB = Math.max(maxB, b);

      avgR += r;
      avgG += g;
      avgB += b;
    }

    const numPixels = imageData.data.length / 4;
    avgR = Math.round(avgR / numPixels);
    avgG = Math.round(avgG / numPixels);
    avgB = Math.round(avgB / numPixels);

    console.log("Color ranges:");
    console.log(`R: ${minR}-${maxR} (avg: ${avgR})`);
    console.log(`G: ${minG}-${maxG} (avg: ${avgG})`);
    console.log(`B: ${minB}-${maxB} (avg: ${avgB})`);

    // Generate features
    const features = [];
    for (let i = 0; i < imageData.data.length; i += 4) {
      features.push(
        rgbToHex(
          imageData.data[i],
          imageData.data[i + 1],
          imageData.data[i + 2],
        ),
      );
    }

    // Save sample pixels for debugging
    let debugContent = "Pixel Samples:\n\n";
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        const idx = (y * TARGET_SIZE + x) * 4;
        debugContent += `(${x},${y}): R=${imageData.data[idx]}, G=${imageData.data[idx + 1]}, B=${imageData.data[idx + 2]}\n`;
      }
    }
    fs.writeFileSync("debug_pixels.txt", debugContent);

    console.log("\nFirst 5 features:", features.slice(0, 5));
    console.log("Last 5 features:", features.slice(-5));
    console.log("Total features:", features.length);

    return features;
  } catch (error) {
    console.error("Error processing image:", error);
    throw error;
  }
}

async function main() {
  try {
    // Get paths
    const imagePath = path.join(__dirname, "received_image.jpg");
    const runImpulsePath = path.join(__dirname, "run-impulse.js");
    const featuresPath = path.join(__dirname, "raw_features.txt");

    // Check image exists
    if (!fs.existsSync(imagePath)) {
      throw new Error("Image not found: " + imagePath);
    }

    // Process image
    console.log("Extracting features from image...");
    const features = await extractImageFeatures(imagePath);

    // Save features
    fs.writeFileSync(featuresPath, features.join(", "));
    console.log("Features saved to", featuresPath);

    // Run classifier
    console.log("\nRunning classifier...");
    const command = `node "${runImpulsePath}" "${featuresPath}"`;

    exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (error) {
        console.error("Error running classifier:", error);
        return;
      }
      if (stderr) {
        console.log("Classifier info:", stderr);
      }
      if (stdout) {
        console.log("Classifier output:\n", stdout);
      }
    });
  } catch (error) {
    console.error("Failed to process image:", error);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

main();
