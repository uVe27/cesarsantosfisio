import sharp from 'sharp';

async function generateStudioPortrait() {
  const width = 900, height = 1125;

  // 1. Create High-End Studio Background (Soft Petrol Teal on Right, Warm Diffused Studio Light on Left)
  const bgSvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="studioGlow" cx="25%" cy="35%" r="75%">
          <stop offset="0%" stop-color="#8ba5ad" />
          <stop offset="45%" stop-color="#46656c" />
          <stop offset="85%" stop-color="#20343a" />
          <stop offset="100%" stop-color="#142226" />
        </radialGradient>
        <radialGradient id="tealAccent" cx="85%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#3d6b73" stop-opacity="0.9" />
          <stop offset="60%" stop-color="#1d383d" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#102024" stop-opacity="0.95" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#studioGlow)" />
      <rect width="100%" height="100%" fill="url(#tealAccent)" style="mix-blend-mode: screen;" />
    </svg>
  `);

  const bgBuffer = await sharp(bgSvg).png().toBuffer();

  // 2. Exact spline silhouette path matching Cesar's real anatomy
  const silhouetteSvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="softEdge">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      <g filter="url(#softEdge)" fill="white">
        <path d="
          M 0 610
          C 120 560, 220 535, 300 520
          C 315 480, 310 440, 295 410
          C 270 380, 270 320, 285 285
          C 295 240, 330 180, 380 155
          C 420 140, 465 140, 510 155
          C 555 175, 585 220, 598 275
          C 610 310, 610 370, 585 410
          C 575 440, 565 480, 580 520
          C 660 535, 760 560, 900 610
          L 900 1125
          L 0 1125
          Z
        " />
      </g>
    </svg>
  `);

  const maskPng = await sharp(silhouetteSvg).png().toBuffer();

  // 3. Color grade Cesar's real photo with warm professional lighting
  const gradedCesar = await sharp('public/images/crop_cesar_perfect.jpg')
    .modulate({
      brightness: 1.04,
      saturation: 1.06
    })
    .linear(1.08, -8) // Rich contrast, deep darks
    .sharpen({ sigma: 1.0, m1: 0.8, m2: 2.0 })
    .toBuffer();

  // 4. Extract Cesar with the soft silhouette mask
  const cesarIsolated = await sharp(gradedCesar)
    .composite([{ input: maskPng, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // 5. Composite Cesar onto the studio background
  await sharp(bgBuffer)
    .composite([{ input: cesarIsolated, blend: 'over' }])
    .webp({ quality: 96 })
    .toFile('public/images/cesar_santos_studio_real.webp');

  await sharp(bgBuffer)
    .composite([{ input: cesarIsolated, blend: 'over' }])
    .jpeg({ quality: 96 })
    .toFile('public/images/cesar_santos_studio_real.jpg');

  console.log('✅ Created studio portrait with 100% real teeth & face in public/images/cesar_santos_studio_real.webp!');
}

generateStudioPortrait().catch(err => console.error(err));
