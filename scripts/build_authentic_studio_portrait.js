import sharp from 'sharp';
import fs from 'fs';

async function buildAuthenticStudioPortrait() {
  // Let's work at high resolution (1600 x 2000, 4:5 ratio)
  const W = 1600, H = 2000;

  // 1. Extract César's bust from the original camera photo (2600 x 4624)
  // Cesar's head center in original is x: 1300, y: 2400
  // Let's crop x: 200 to 2400 (width: 2200), y: 1350 to 4100 (height: 2750)
  const origCrop = await sharp('VARIOS/FOTO CESAR.jpg')
    .extract({ left: 200, top: 1350, width: 2200, height: 2750 })
    .resize(W, H, { fit: 'cover' })
    .toBuffer();

  // 2. Build High-End Neutral Studio Background
  // Soft, diffused, elegant gradient of Deep Petrol Teal, Slate Charcoal, and subtle warm glow
  const bgSvg = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="studioCenterGlow" cx="45%" cy="38%" r="65%">
          <stop offset="0%" stop-color="#46676f" />
          <stop offset="40%" stop-color="#2a454c" />
          <stop offset="75%" stop-color="#192b30" />
          <stop offset="100%" stop-color="#101c20" />
        </radialGradient>
        <radialGradient id="warmLightRim" cx="20%" cy="30%" r="50%">
          <stop offset="0%" stop-color="#7a9fa8" stop-opacity="0.5" />
          <stop offset="50%" stop-color="#3d626a" stop-opacity="0.2" />
          <stop offset="100%" stop-color="#101c20" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#studioCenterGlow)" />
      <rect width="100%" height="100%" fill="url(#warmLightRim)" />
    </svg>
  `);
  const bgBuffer = await sharp(bgSvg).png().toBuffer();

  // 3. Precise multi-point silhouette path for Cesar's real body at 1600x2000 resolution
  // Let's map key coordinates:
  // Head top: (800, 240)
  // Left hair curve: (680, 280), (600, 370), (540, 480)
  // Left temple/ear: (510, 560), (490, 640), (500, 740)
  // Left jaw/chin: (530, 800), (580, 920)
  // Left neck: (610, 1000)
  // Left shoulder: (550, 1060), (380, 1140), (180, 1260), (0, 1380)
  // Left arm/body down: (0, 2000)
  // Bottom edge: (1600, 2000)
  // Right arm/body up: (1600, 1380)
  // Right shoulder: (1420, 1260), (1220, 1140), (1050, 1060)
  // Right neck: (990, 1000)
  // Right jaw/chin: (1020, 920), (1070, 800)
  // Right ear/temple: (1100, 740), (1110, 640), (1090, 560)
  // Right hair curve: (1060, 480), (1000, 370), (920, 280)
  
  const maskSvg = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="featherEdge">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <g filter="url(#featherEdge)" fill="white">
        <path d="
          M 0 1380
          C 180 1260, 380 1140, 550 1060
          C 590 1020, 600 960, 570 880
          C 530 800, 490 720, 495 620
          C 500 530, 540 430, 610 340
          C 680 260, 730 230, 800 230
          C 870 230, 920 260, 990 340
          C 1060 430, 1100 530, 1105 620
          C 1110 720, 1070 800, 1030 880
          C 1000 960, 1010 1020, 1050 1060
          C 1220 1140, 1420 1260, 1600 1380
          L 1600 2000
          L 0 2000
          Z
        " />
      </g>
    </svg>
  `);
  const maskPng = await sharp(maskSvg).png().toBuffer();

  // 4. Color-grade César's real image with warm studio lighting and rich contrast
  const gradedCesar = await sharp('VARIOS/FOTO CESAR.jpg')
    .extract({ left: 200, top: 1350, width: 2200, height: 2750 })
    .resize(W, H, { fit: 'fill' })
    .modulate({
      brightness: 1.05,
      saturation: 1.10
    })
    .linear(1.10, -8) // deep darks, rich midtones
    .sharpen({ sigma: 1.2, m1: 1.0, m2: 2.0 })
    .toBuffer();

  // 5. Extract Cesar with the soft mask
  const isolatedCesar = await sharp(gradedCesar)
    .composite([{ input: maskPng, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // 6. Composite Cesar onto the Neutral Studio Background
  await sharp(bgBuffer)
    .composite([{ input: isolatedCesar, blend: 'over' }])
    .webp({ quality: 95 })
    .toFile('public/images/cesar_authentic_studio_final.webp');

  await sharp('public/images/cesar_authentic_studio_final.webp')
    .jpeg({ quality: 95 })
    .toFile('public/images/cesar_authentic_studio_final.jpg');

  console.log('✅ Generated authentic studio portrait in public/images/cesar_authentic_studio_final.webp!');
}

buildAuthenticStudioPortrait().catch(err => console.error(err));
