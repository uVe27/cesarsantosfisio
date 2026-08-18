import sharp from 'sharp';

async function buildPixelPerfectPortrait() {
  const W = 1200, H = 1500;

  // 1. Base crop of César from VARIOS/FOTO CESAR.jpg
  // In 2600 x 4624:
  // Head is centered at x: 1300, y: 2200
  // Let's crop: left: 250, top: 1300, width: 2100, height: 2625
  const rawCrop = await sharp('VARIOS/FOTO CESAR.jpg')
    .extract({ left: 250, top: 1300, width: 2100, height: 2625 })
    .resize(W, H, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = rawCrop;
  const pixels = Buffer.from(data);
  const alphaChannel = Buffer.alloc(W * H);

  // Analyze each pixel (x, y)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const idx = (y * W + x) * 3;
      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];

      // Distance from head center (cx: 600, cy: 380)
      const dx = x - 600;
      const dy = y - 380;

      // 1. Below shoulders (y >= 680): 100% César's real shirt and chest
      if (y >= 680) {
        alphaChannel[y * W + x] = 255;
        continue;
      }

      // 2. Head ellipse (hair, face, ears, neck)
      // Head width radius: ~170px, height radius: ~230px
      const normDist = (dx * dx) / (165 * 165) + (dy * dy) / (235 * 235);

      if (normDist < 0.85) {
        // Inner core of head/face: 100% César
        alphaChannel[y * W + x] = 255;
      } else if (normDist < 1.15) {
        // Transition edge around hair and ears:
        // Detect if pixel is hair (dark: r < 60, g < 60, b < 60) or skin (warm: r > g, g > b)
        const isDarkHair = (r < 75 && g < 75 && b < 75);
        const isWarmSkin = (r > 90 && g > 60 && b > 40 && r > b + 15);
        
        if (isDarkHair || isWarmSkin) {
          // It's César's hair or ear!
          const edgeFade = 1.0 - (normDist - 0.85) / 0.30;
          alphaChannel[y * W + x] = Math.min(255, Math.max(0, Math.round(edgeFade * 255)));
        } else {
          // It's background (ceiling gray or wood closet)
          alphaChannel[y * W + x] = 0;
        }
      } else {
        // Outside head boundary above shoulders
        // Check neck area (y between 520 and 680, x between 460 and 740)
        if (y >= 520 && x >= 460 && x <= 740) {
          alphaChannel[y * W + x] = 255;
        } else if (y >= 600 && (x < 460 || x > 740)) {
          // Shoulders slope
          const shoulderY = 600 + Math.abs(dx - 100) * 0.35;
          if (y >= shoulderY) {
            alphaChannel[y * W + x] = 255;
          } else {
            alphaChannel[y * W + x] = 0;
          }
        } else {
          alphaChannel[y * W + x] = 0;
        }
      }
    }
  }

  // Smooth the alpha channel with a fast Gaussian blur box
  // Create RGBA buffer
  const rgbaBuffer = Buffer.alloc(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    rgbaBuffer[i * 4] = pixels[i * 3];
    rgbaBuffer[i * 4 + 1] = pixels[i * 3 + 1];
    rgbaBuffer[i * 4 + 2] = pixels[i * 3 + 2];
    rgbaBuffer[i * 4 + 3] = alphaChannel[i];
  }

  // Soften alpha edge
  const isolatedCesar = await sharp(rgbaBuffer, {
    raw: { width: W, height: H, channels: 4 }
  })
    .blur(1.5)
    .png()
    .toBuffer();

  // Create Beautiful Neutral Studio Background
  const bgSvg = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="centerStudio" cx="50%" cy="32%" r="65%">
          <stop offset="0%" stop-color="#3b5d66" />
          <stop offset="45%" stop-color="#233a40" />
          <stop offset="85%" stop-color="#142226" />
          <stop offset="100%" stop-color="#0c171a" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#centerStudio)" />
    </svg>
  `);
  const bgPng = await sharp(bgSvg).png().toBuffer();

  // Color grade César's real image for studio warmth & crisp definition
  const gradedCesar = await sharp(isolatedCesar)
    .modulate({
      brightness: 1.05,
      saturation: 1.10
    })
    .linear(1.10, -6)
    .sharpen({ sigma: 1.1, m1: 0.9, m2: 2.0 })
    .toBuffer();

  // Composite real Cesar over studio background
  const finalComp = await sharp(bgPng)
    .composite([{ input: gradedCesar, blend: 'over' }])
    .webp({ quality: 95 })
    .toFile('public/images/cesar_pixel_real.webp');

  await sharp('public/images/cesar_pixel_real.webp')
    .jpeg({ quality: 95 })
    .toFile('public/images/cesar_pixel_real.jpg');

  console.log('✅ Generated pixel-perfect real portrait in public/images/cesar_pixel_real.jpg');
}

buildPixelPerfectPortrait().catch(err => console.error(err));
