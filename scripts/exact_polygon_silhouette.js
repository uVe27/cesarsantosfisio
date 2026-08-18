import sharp from 'sharp';

async function buildExactPolygonSilhouette() {
  const W = 900, H = 1125;

  // 1. High-resolution neutral luxury studio background (Petrol teal & slate gray)
  const bgSvg = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="studioSoftGlow" cx="48%" cy="32%" r="60%">
          <stop offset="0%" stop-color="#466d75" />
          <stop offset="35%" stop-color="#2d494f" />
          <stop offset="70%" stop-color="#1b2f34" />
          <stop offset="100%" stop-color="#0f1d20" />
        </radialGradient>
        <!-- Soft rim light from left -->
        <linearGradient id="rimLightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#73a1ab" stop-opacity="0.35" />
          <stop offset="40%" stop-color="#2d494f" stop-opacity="0.1" />
          <stop offset="100%" stop-color="#0f1d20" stop-opacity="0" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#studioSoftGlow)" />
      <rect width="100%" height="100%" fill="url(#rimLightGrad)" />
    </svg>
  `);
  const bgPng = await sharp(bgSvg).png().toBuffer();

  // 2. High-precision vector silhouette of César's real head and body
  const maskSvg = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="softFeatherEdge">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      <g filter="url(#softFeatherEdge)" fill="white">
        <path d="
          M 0 600
          C 80 570, 180 540, 290 525
          L 325 500
          L 300 440
          L 282 390
          L 280 330
          L 310 270
          L 350 200
          L 410 160
          L 440 160
          L 500 200
          L 540 270
          L 560 330
          L 555 390
          L 540 440
          L 520 500
          C 620 535, 730 565, 900 605
          L 900 1125
          L 0 1125
          Z
        " />
      </g>
    </svg>
  `);
  const maskPng = await sharp(maskSvg).png().toBuffer();

  // 3. Studio color grade on César's real image:
  // - Calibrated warm skin tones
  // - Luminous softbox light on face & eyes
  // - Deep contrast on hair and beard
  const realCesarGraded = await sharp('C:/Users/masth/.gemini/antigravity-cli/brain/d1794d72-a330-47b6-a8a2-c9c4ee45b674/crop_cesar_perfect.jpg')
    .modulate({
      brightness: 1.08,
      saturation: 1.14
    })
    .linear(1.12, -8)
    .sharpen({ sigma: 1.2, m1: 1.0, m2: 2.0 })
    .toBuffer();

  // 4. Cut out Cesar using the precise silhouette mask
  const isolatedRealCesar = await sharp(realCesarGraded)
    .composite([{ input: maskPng, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // 5. Composite César onto the Neutral Studio Gradient Background
  const finalStudioPortrait = await sharp(bgPng)
    .composite([{ input: isolatedRealCesar, blend: 'over' }])
    .webp({ quality: 96 })
    .toFile('public/images/cesar_santos_studio_real_cutout.webp');

  await sharp('public/images/cesar_santos_studio_real_cutout.webp')
    .jpeg({ quality: 96 })
    .toFile('public/images/cesar_santos_studio_real_cutout.jpg');

  console.log('✅ Generated cesar_santos_studio_real_cutout.jpg');
}

buildExactPolygonSilhouette().catch(err => console.error(err));
