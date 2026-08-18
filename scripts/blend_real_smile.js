import sharp from 'sharp';

async function blendRealSmile() {
  // studio base: 1000 x 747
  // Let's find exact coordinates in 1000 x 747 image:
  // Face box: left: 360, top: 220, width: 280, height: 320
  // Nose tip in studio image is at: left + 145 = 505, top + 70 = 290.
  // Artificial mouth is at: x: 500, y: 340 to 390.
  // Chin is at: x: 500, y: 440.

  // In original photo VARIOS/FOTO CESAR.jpg (2600 x 4624):
  // Nose tip is at x: 1200, y: 1950.
  // Real mouth is at: x: 1200, y: 2060.
  // Real chin is at: x: 1200, y: 2250.
  // Real mustache width is ~500px, height ~350px.

  // Extract from original photo:
  const realMouth = await sharp('VARIOS/FOTO CESAR.jpg')
    .extract({ left: 930, top: 1990, width: 540, height: 320 })
    .resize(165, 98, { fit: 'fill' })
    .modulate({
      brightness: 1.02,
      saturation: 1.12
    })
    .linear(1.08, -6)
    .toBuffer();

  const maskSvg = Buffer.from(`
    <svg width="165" height="98" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="feather" cx="50%" cy="50%" r="50%">
          <stop offset="35%" stop-color="white" stop-opacity="1" />
          <stop offset="70%" stop-color="white" stop-opacity="0.8" />
          <stop offset="100%" stop-color="white" stop-opacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="82" cy="49" rx="74" ry="42" fill="url(#feather)" />
    </svg>
  `);

  const maskPng = await sharp(maskSvg).png().toBuffer();

  const featheredRealMouth = await sharp(realMouth)
    .composite([{ input: maskPng, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // Overlay mouth directly over the mouth region
  const blended = await sharp('public/images/current_portrait_view.jpg')
    .composite([{
      input: featheredRealMouth,
      top: 312,
      left: 422,
      blend: 'over'
    }])
    .toBuffer();

  await sharp(blended)
    .webp({ quality: 96 })
    .toFile('public/images/cesar_santos_studio_authentic_teeth.webp');

  await sharp(blended)
    .jpeg({ quality: 96 })
    .toFile('public/images/cesar_santos_studio_authentic_teeth.jpg');

  console.log('✅ Generated studio portrait with real teeth in public/images/cesar_santos_studio_authentic_teeth.jpg');
}

blendRealSmile().catch(err => console.error(err));
