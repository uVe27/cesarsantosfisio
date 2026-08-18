import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function finalizePortrait() {
  const generatedImagePath = 'C:/Users/masth/.gemini/antigravity-cli/brain/d1794d72-a330-47b6-a8a2-c9c4ee45b674/cesar_studio_authentic_smile_1787045033958.jpg';
  
  const baseImg = sharp(generatedImagePath);
  const meta = await baseImg.metadata();
  console.log('Generated base image meta:', meta.width, 'x', meta.height);

  // 1. Prepare exact official brand logo patch for the chest
  // In the 1200x896 image, the left chest area is at x: 670, y: 630
  const logoPatch = await sharp('public/LOGO/logo_light.png')
    .resize(110, 100, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .modulate({ brightness: 0.95, saturation: 1.1 })
    .toBuffer();

  // Cover the green spine artifact
  const shirtColorSample = Buffer.from(`
    <svg width="130" height="130" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="shirtPatch" cx="50%" cy="50%" r="50%">
          <stop offset="60%" stop-color="#b8d8ec" />
          <stop offset="100%" stop-color="#b8d8ec" stop-opacity="0" />
        </radialGradient>
      </defs>
      <circle cx="65" cy="65" r="65" fill="url(#shirtPatch)" />
    </svg>
  `);
  const shirtPatchPng = await sharp(shirtColorSample).png().toBuffer();

  // 2. Composite clean shirt patch + official brand logo
  const finalComposition = await sharp(generatedImagePath)
    .composite([
      { input: shirtPatchPng, left: 640, top: 610, blend: 'over' },
      { input: logoPatch, left: 650, top: 625, blend: 'over' }
    ])
    .webp({ quality: 95 })
    .toFile('public/images/cesar_santos_portrait.webp');

  await sharp('public/images/cesar_santos_portrait.webp')
    .jpeg({ quality: 95 })
    .toFile('public/images/cesar_santos_portrait_preview.jpg');

  console.log('✅ Finalized cesar_santos_portrait.webp with authentic natural smile, studio lighting, and official brand shirt logo!');
}

finalizePortrait().catch(err => console.error(err));
