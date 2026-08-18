import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function processLogos() {
  const inputPath = path.resolve('VARIOS/LOGO TRANSPARENTE.png');
  const input = sharp(inputPath);
  const { data, info } = await input.raw().toBuffer({ resolveWithObject: true });
  
  // Find bounding box
  let minX = info.width, minY = info.height, maxX = 0, maxY = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * info.channels;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      if (r < 240 || g < 240 || b < 240) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const pad = 15;
  const cropX = Math.max(0, minX - pad);
  const cropY = Math.max(0, minY - pad);
  const cropW = Math.min(info.width - cropX, maxX - minX + pad * 2);
  const cropH = Math.min(info.height - cropY, maxY - minY + pad * 2);

  console.log('Cropping region:', { cropX, cropY, cropW, cropH });

  const lightData = Buffer.alloc(cropW * cropH * 4);
  const darkData = Buffer.alloc(cropW * cropH * 4);

  for (let y = 0; y < cropH; y++) {
    for (let x = 0; x < cropW; x++) {
      const srcIdx = ((cropY + y) * info.width + (cropX + x)) * info.channels;
      const destIdx = (y * cropW + x) * 4;

      const r = data[srcIdx], g = data[srcIdx+1], b = data[srcIdx+2];
      const lum = (r * 0.299 + g * 0.587 + b * 0.114);
      
      // Strict thresholding to guarantee 0% background noise and smooth antialiasing
      let alpha = 0;
      if (lum <= 75) {
        alpha = 255;
      } else if (lum < 195) {
        alpha = Math.round(((195 - lum) / (195 - 75)) * 255);
      }

      // Light mode: Original brand colors on 100% transparent background
      lightData[destIdx] = r;
      lightData[destIdx+1] = g;
      lightData[destIdx+2] = b;
      lightData[destIdx+3] = alpha;

      // Dark mode: Crisp bright white and luminous teal on 100% transparent background
      if (alpha > 0) {
        // Detect teal/accent vs dark text
        if (g > r + 8 && g > b) {
          // Teal element (#5ca1a8)
          darkData[destIdx] = 0x5C;
          darkData[destIdx+1] = 0xA1;
          darkData[destIdx+2] = 0xA8;
        } else {
          // Main text / Slate (#ebf1f0)
          darkData[destIdx] = 0xEB;
          darkData[destIdx+1] = 0xF1;
          darkData[destIdx+2] = 0xF0;
        }
        darkData[destIdx+3] = alpha;
      } else {
        darkData[destIdx] = 0;
        darkData[destIdx+1] = 0;
        darkData[destIdx+2] = 0;
        darkData[destIdx+3] = 0;
      }
    }
  }

  // Save Light Mode Logo
  await sharp(lightData, { raw: { width: cropW, height: cropH, channels: 4 } })
    .png()
    .toFile('public/LOGO/logo_light.png');

  await sharp(lightData, { raw: { width: cropW, height: cropH, channels: 4 } })
    .webp({ quality: 95 })
    .toFile('public/LOGO/logo_light.webp');

  // Save Dark Mode Logo
  await sharp(darkData, { raw: { width: cropW, height: cropH, channels: 4 } })
    .png()
    .toFile('public/LOGO/logo_dark.png');

  await sharp(darkData, { raw: { width: cropW, height: cropH, channels: 4 } })
    .webp({ quality: 95 })
    .toFile('public/LOGO/logo_dark.webp');

  // Also overwrite LOGO TRANSPARENTE.png with clean transparent light version
  await sharp(lightData, { raw: { width: cropW, height: cropH, channels: 4 } })
    .png()
    .toFile('public/LOGO/LOGO TRANSPARENTE.png');

  console.log('✅ Transparent logos created in public/LOGO/ successfully!');
}

processLogos().catch(err => console.error(err));
