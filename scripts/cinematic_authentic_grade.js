import sharp from 'sharp';

async function createCinematicGrade() {
  const W = 1000, H = 1250;

  // 1. Precise crop from VARIOS/FOTO CESAR.jpg
  const baseImg = await sharp('VARIOS/FOTO CESAR.jpg')
    .extract({ left: 350, top: 1250, width: 1900, height: 2375 })
    .resize(W, H, { fit: 'fill' })
    .toBuffer();

  // 2. Create rich studio color grading & lighting enhancement:
  // - Neutralize greenish tint with warm skin calibration
  // - Lift eye and face luminosity (key light effect)
  // - Deepen background shadows to turn closet into rich dark architectural wood
  const studioLightingGradient = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Center face key light glow -->
        <radialGradient id="faceKeyLight" cx="49%" cy="33%" r="35%">
          <stop offset="0%" stop-color="#fff5ea" stop-opacity="0.18" />
          <stop offset="70%" stop-color="#fff5ea" stop-opacity="0.06" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0" />
        </radialGradient>
        <!-- Background dark slate & petrol teal vignette -->
        <radialGradient id="studioVignette" cx="49%" cy="38%" r="65%">
          <stop offset="45%" stop-color="#000000" stop-opacity="0" />
          <stop offset="80%" stop-color="#1b3036" stop-opacity="0.45" />
          <stop offset="100%" stop-color="#0e1b1f" stop-opacity="0.80" />
        </radialGradient>
      </defs>
      <!-- Key light on face -->
      <rect width="100%" height="100%" fill="url(#faceKeyLight)" style="mix-blend-mode: screen;" />
      <!-- Dark slate vignette on room background -->
      <rect width="100%" height="100%" fill="url(#studioVignette)" style="mix-blend-mode: multiply;" />
    </svg>
  `);
  const lightingOverlayPng = await sharp(studioLightingGradient).png().toBuffer();

  const finalGraded = await sharp(baseImg)
    .modulate({
      brightness: 1.07,
      saturation: 1.12
    })
    .linear(1.15, -12) // deep cinematic contrast, crisp blacks
    .sharpen({ sigma: 1.2, m1: 1.0, m2: 2.2 }) // ultra-sharp eyes, beard, teeth, and shirt logo
    .composite([{ input: lightingOverlayPng, blend: 'over' }])
    .toBuffer();

  // Save as production files
  await sharp(finalGraded)
    .webp({ quality: 96 })
    .toFile('public/images/cesar_santos_portrait.webp');

  await sharp('public/images/cesar_santos_portrait.webp')
    .jpeg({ quality: 96 })
    .toFile('public/images/cesar_cinematic_authentic.jpg');

  // Also sync cesar_santos_authentic.webp
  await sharp('public/images/cesar_santos_portrait.webp')
    .webp({ quality: 96 })
    .toFile('public/images/cesar_santos_authentic.webp');

  console.log('✅ Generated 100% authentic César Santos portrait in public/images/cesar_santos_portrait.webp!');
}

createCinematicGrade().catch(err => console.error(err));
