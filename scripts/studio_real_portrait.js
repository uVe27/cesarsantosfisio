import sharp from 'sharp';

async function createAuthenticStudioReal() {
  const W = 900, H = 1125;
  
  // 1. High-resolution crop from VARIOS/FOTO CESAR.jpg
  // Focus tightly on head and chest
  const baseBuffer = await sharp('VARIOS/FOTO CESAR.jpg')
    .extract({ left: 350, top: 1250, width: 1900, height: 2375 })
    .resize(W, H, { fit: 'fill' })
    .toBuffer();

  // 2. Create heavy creamy bokeh version with petrol teal & slate tone for the background
  const bgBokeh = await sharp(baseBuffer)
    .blur(65) // Ultra-smooth creamy studio bokeh
    .modulate({
      brightness: 0.78,
      saturation: 1.05
    })
    .toBuffer();

  // Color grade the background with deep petrol teal & slate tint
  const tealGradSvg = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="tealGrad" cx="50%" cy="35%" r="65%">
          <stop offset="25%" stop-color="#3b6b73" stop-opacity="0.3" />
          <stop offset="65%" stop-color="#234148" stop-opacity="0.75" />
          <stop offset="100%" stop-color="#102226" stop-opacity="0.95" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#tealGrad)" />
    </svg>
  `);
  const tealGradPng = await sharp(tealGradSvg).png().toBuffer();

  const studioBackground = await sharp(bgBokeh)
    .composite([{ input: tealGradPng, blend: 'over' }])
    .toBuffer();

  // 3. Solid unified subject mask for Cesar without any gaps
  const subjectMaskSvg = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="softFeather">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>
      <g filter="url(#softFeather)" fill="white">
        <!-- Head tightly matching hair contour -->
        <ellipse cx="445" cy="350" rx="150" ry="195" />
        <!-- Neck -->
        <polygon points="320,440 570,440 600,580 290,580" />
        <!-- Torso, Chest, and Arms -->
        <rect x="0" y="550" width="${W}" height="575" />
      </g>
    </svg>
  `);
  const subjectMaskPng = await sharp(subjectMaskSvg).png().toBuffer();

  // 4. Color-grade César's real person with professional studio lighting:
  // - Calibrated warm skin tones
  // - Crisp eye and beard detail
  // - High-contrast richness
  const gradedCesar = await sharp(baseBuffer)
    .modulate({
      brightness: 1.06,
      saturation: 1.12
    })
    .linear(1.12, -8)
    .sharpen({ sigma: 1.2, m1: 1.0, m2: 2.5 })
    .composite([{ input: subjectMaskPng, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // 5. Composite crisp César over creamy studio background
  const finalPortrait = await sharp(studioBackground)
    .composite([{ input: gradedCesar, blend: 'over' }])
    .webp({ quality: 95 })
    .toFile('public/images/cesar_santos_authentic_studio.webp');

  await sharp('public/images/cesar_santos_authentic_studio.webp')
    .jpeg({ quality: 95 })
    .toFile('public/images/cesar_santos_authentic_studio.jpg');

  console.log('✅ Created cesar_santos_authentic_studio.jpg');
}

createAuthenticStudioReal().catch(err => console.error(err));
