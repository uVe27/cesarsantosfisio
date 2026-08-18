import sharp from 'sharp';

async function finalizePortrait() {
  const generatedPath = 'C:/Users/masth/.gemini/antigravity-cli/brain/d1794d72-a330-47b6-a8a2-c9c4ee45b674/cesar_retouched_studio_portrait_1787052264172.jpg';

  // Read metadata
  const meta = await sharp(generatedPath).metadata();
  const W = meta.width;
  const H = meta.height;

  // Let's refine the logo on the chest using the official high-res logo
  // Logo size on chest: width ~180px
  const logoChest = await sharp('public/LOGO/logo_light.png')
    .resize(175)
    .toBuffer();

  // In this generated image (896 x 1200), the chest logo is located around x: 500, y: 780
  const finalComp = await sharp(generatedPath)
    .composite([
      { input: logoChest, left: 525, top: 780, blend: 'over' }
    ])
    .webp({ quality: 96 })
    .toBuffer();

  // Save to public/images/cesar_santos_portrait.webp and .jpg
  await sharp(finalComp)
    .toFile('public/images/cesar_santos_portrait.webp');

  await sharp(finalComp)
    .jpeg({ quality: 96 })
    .toFile('public/images/cesar_santos_portrait.jpg');

  // Also sync cesar_santos_authentic.webp
  await sharp(finalComp)
    .toFile('public/images/cesar_santos_authentic.webp');

  console.log('✅ Finalized perfect retouched portrait in public/images/cesar_santos_portrait.webp and .jpg');
}

finalizePortrait().catch(err => console.error(err));
