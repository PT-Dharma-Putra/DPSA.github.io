import { Jimp } from 'jimp';
import path from 'path';
import fs from 'fs';

async function run() {
  const imgPath = "C:/Users/ASUS/.gemini/antigravity-ide/brain/tempmediaStorage/media__1780910144951.png";
  console.log("Loading image buffer...");
  const buffer = fs.readFileSync(imgPath);
  const image = await Jimp.read(buffer);
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  console.log(`Image dimensions: ${width}x${height}`);

  // We want to find a row index that separates the two logos.
  // The first logo is "Kemenkes RS Nusantara".
  // The second logo is "Bali International Hospital".
  // Let's find a row in the middle 30% to 70% height range that is empty/white.
  let splitY = Math.floor(height / 2);
  let bestRow = splitY;
  let minDiff = Infinity;

  // Let's find a row with minimum variance or closest to pure white / transparent
  for (let y = Math.floor(height * 0.35); y < Math.floor(height * 0.65); y++) {
    let nonWhiteCount = 0;
    for (let x = 0; x < width; x++) {
      const pixelColor = image.getPixelColor(x, y); // RGBA hex number
      const r = (pixelColor >> 24) & 0xff;
      const g = (pixelColor >> 16) & 0xff;
      const b = (pixelColor >> 8) & 0xff;
      const a = pixelColor & 0xff;
      
      // If it is not white (R>245, G>245, B>245) and not transparent (A<10)
      if (!(a < 10 || (r > 245 && g > 245 && b > 245))) {
        nonWhiteCount++;
      }
    }
    if (nonWhiteCount < minDiff) {
      minDiff = nonWhiteCount;
      bestRow = y;
    }
  }

  console.log(`Determined split row at Y = ${bestRow} with non-white pixel count = ${minDiff}`);

  // Crop top logo
  const topImg = image.clone().crop({ x: 0, y: 0, w: width, h: bestRow });
  // Crop bottom logo
  const bottomImg = image.clone().crop({ x: 0, y: bestRow, w: width, h: height - bestRow });

  // Let's trim function (simple bounding box search)
  function getBBox(img) {
    const w = img.bitmap.width;
    const h = img.bitmap.height;
    let minX = w, maxX = 0, minY = h, maxY = 0;
    let found = false;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const color = img.getPixelColor(x, y);
        const r = (color >> 24) & 0xff;
        const g = (color >> 16) & 0xff;
        const b = (color >> 8) & 0xff;
        const a = color & 0xff;

        // If not white/transparent, it's content
        if (!(a < 10 || (r > 250 && g > 250 && b > 250))) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          found = true;
        }
      }
    }

    if (!found) return null;
    // Add 5px padding around bounding box if possible
    minX = Math.max(0, minX - 5);
    minY = Math.max(0, minY - 5);
    maxX = Math.min(w - 1, maxX + 5);
    maxY = Math.min(h - 1, maxY + 5);
    return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
  }

  const topBBox = getBBox(topImg);
  const finalTop = topBBox ? topImg.clone().crop(topBBox) : topImg;

  const bottomBBox = getBBox(bottomImg);
  const finalBottom = bottomBBox ? bottomImg.clone().crop(bottomBBox) : bottomImg;

  // Save them
  await finalTop.write("e:/Fani/Semester Kerja/DPSA/webDPSA/public/images/client/RS Nusantara.png");
  await finalBottom.write("e:/Fani/Semester Kerja/DPSA/webDPSA/public/images/client/Bali International Hospital.png");
  console.log("Logos saved successfully!");
}

run().catch(err => {
  console.error(err);
});
