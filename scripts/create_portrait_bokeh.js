import sharp from 'sharp';

async function createCinematicBokeh() {
  const width = 900, height = 1125;
  
  // 1. Base color-graded image
  const baseBuffer = await sharp('public/images/cesar_santos_real_graded.jpg').toBuffer();
  
  // 2. Heavily blurred background version with soft warm studio atmosphere
  const bgBlurred = await sharp(baseBuffer)
    .blur(40)
    .modulate({ brightness: 0.92, saturation: 0.85 })
    .toBuffer();

  // 3. Precise subject mask for Cesar
  const maskSvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="maskBlur">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="black" />
      <g filter="url(#maskBlur)" fill="white">
        <ellipse cx="445" cy="350" rx="160" ry="200" />
        <polygon points="350,480 540,480 570,620 320,620" />
        <path d="M 0 650 Q 250 535 445 535 Q 640 535 900 650 L 900 1125 L 0 1125 Z" />
        <rect x="0" y="600" width="280" height="525" />
        <rect x="620" y="600" width="280" height="525" />
      </g>
    </svg>
  `);

  const maskPng = await sharp(maskSvg).png().toBuffer();

  // Extract Cesar with alpha mask
  const fgCesar = await sharp(baseBuffer)
    .composite([{ input: maskPng, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // Composite crisp Cesar over blurred background
  await sharp(bgBlurred)
    .composite([{ input: fgCesar, blend: 'over' }])
    .webp({ quality: 95 })
    .toFile('public/images/cesar_santos_studio_bokeh.webp');

  await sharp(bgBlurred)
    .composite([{ input: fgCesar, blend: 'over' }])
    .jpeg({ quality: 95 })
    .toFile('public/images/cesar_santos_studio_bokeh.jpg');

  console.log('✅ Created studio bokeh portrait with 100% real teeth in public/images/cesar_santos_studio_bokeh.webp!');
}

createCinematicBokeh().catch(err => console.error(err));
