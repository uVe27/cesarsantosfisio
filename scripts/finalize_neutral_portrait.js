import sharp from 'sharp';

async function finalizeNeutralPortrait() {
  const generatedImagePath = 'C:/Users/masth/.gemini/antigravity-cli/brain/d1794d72-a330-47b6-a8a2-c9c4ee45b674/cesar_neutral_studio_portrait_1787045495239.jpg';
  
  const baseImg = sharp(generatedImagePath);
  const meta = await baseImg.metadata();
  console.log('Image dimensions:', meta.width, 'x', meta.height);

  // 1. Prepare exact official brand logo patch for the chest
  // In the 1200x896 image, the left chest is around x: 650 to 770, y: 720 to 820
  const logoPatch = await sharp('public/LOGO/logo_light.png')
    .resize(115, 105, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .modulate({ brightness: 0.95, saturation: 1.1 })
    .toBuffer();

  // Composite official brand logo onto chest
  await sharp(generatedImagePath)
    .composite([
      { input: logoPatch, left: 660, top: 730, blend: 'over' }
    ])
    .webp({ quality: 95 })
    .toFile('public/images/cesar_santos_portrait.webp');

  await sharp('public/images/cesar_santos_portrait.webp')
    .jpeg({ quality: 95 })
    .toFile('public/images/cesar_neutral_preview.jpg');

  // Also update cesar_santos_authentic.webp
  await sharp('public/images/cesar_santos_portrait.webp')
    .webp({ quality: 95 })
    .toFile('public/images/cesar_santos_authentic.webp');

  console.log('✅ Finalized neutral studio portrait in public/images/cesar_santos_portrait.webp!');
}

finalizeNeutralPortrait().catch(err => console.error(err));
