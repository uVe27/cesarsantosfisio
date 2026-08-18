import sharp from 'sharp';

async function blendRealFaceStudio() {
  const studioMeta = await sharp('C:/Users/masth/.gemini/antigravity-cli/brain/d1794d72-a330-47b6-a8a2-c9c4ee45b674/cesar_perfect_studio_portrait_1787052159808.jpg').metadata();
  const W = studioMeta.width;
  const H = studioMeta.height;
  console.log('Studio image size:', W, H);

  // In cesar_perfect_studio_portrait_1787052159808.jpg (896 x 1152):
  // Head center: x: 448, y: 350
  // Eye level: y: 315
  // Nose: y: 390
  // Mouth: y: 470
  // Chin: y: 560
  // Width between eyes: ~165px

  // In crop_cesar_perfect.jpg (900 x 1125):
  // Cesar's head: left: 240, top: 140, width: 440, height: 490
  // Studio head (896 x 1200): left: 250, top: 100, width: 400, height: 490
  const realFace = await sharp('C:/Users/masth/.gemini/antigravity-cli/brain/d1794d72-a330-47b6-a8a2-c9c4ee45b674/crop_cesar_perfect.jpg')
    .extract({ left: 240, top: 140, width: 440, height: 490 })
    .resize(390, 480, { fit: 'fill' })
    .modulate({
      brightness: 1.05,
      saturation: 1.12
    })
    .linear(1.10, -6)
    .sharpen({ sigma: 1.1, m1: 0.9, m2: 2.0 })
    .toBuffer();

  // Create a smooth elliptical alpha mask for the real face
  const faceMaskSvg = Buffer.from(`
    <svg width="390" height="480" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="faceGrad" cx="50%" cy="48%" r="48%">
          <stop offset="65%" stop-color="white" stop-opacity="1" />
          <stop offset="88%" stop-color="white" stop-opacity="0.75" />
          <stop offset="100%" stop-color="white" stop-opacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="195" cy="240" rx="165" ry="215" fill="url(#faceGrad)" />
    </svg>
  `);
  const faceMaskPng = await sharp(faceMaskSvg).png().toBuffer();

  const maskedRealFace = await sharp(realFace)
    .composite([{ input: faceMaskPng, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // Composite the real face onto the studio portrait
  const blendedResult = await sharp('C:/Users/masth/.gemini/antigravity-cli/brain/d1794d72-a330-47b6-a8a2-c9c4ee45b674/cesar_perfect_studio_portrait_1787052159808.jpg')
    .composite([{ input: maskedRealFace, left: 250, top: 120, blend: 'over' }])
    .toBuffer();

  // Add official brand logo on the chest
  const logoBuffer = await sharp('public/LOGO/logo_light.png')
    .resize(175)
    .toBuffer();

  const finalOutput = await sharp(blendedResult)
    .composite([{ input: logoBuffer, left: 490, top: 670, blend: 'over' }])
    .webp({ quality: 96 })
    .toFile('public/images/cesar_blended_authentic.webp');

  await sharp('public/images/cesar_blended_authentic.webp')
    .jpeg({ quality: 96 })
    .toFile('public/images/cesar_blended_authentic.jpg');

  console.log('✅ Generated cesar_blended_authentic.jpg');
}

blendRealFaceStudio().catch(err => console.error(err));
