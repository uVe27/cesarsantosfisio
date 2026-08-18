import sharp from 'sharp';

async function createProfessionalAuthenticPortraits() {
  const input = 'public/images/crop_cesar_perfect.jpg';

  // 1. Style A: "Studio Warm & Crisp" (Rich contrast, warm natural skin tones, eye sharpness, subtle corner vignette)
  const vignetteSvg = Buffer.from(`
    <svg width="900" height="1125" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="vignette" cx="50%" cy="40%" r="65%">
          <stop offset="55%" stop-color="#000000" stop-opacity="0" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0.35" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#vignette)" />
    </svg>
  `);

  const vignettePng = await sharp(vignetteSvg).png().toBuffer();

  const gradedA = await sharp(input)
    .modulate({
      brightness: 1.05,
      saturation: 1.10
    })
    .linear(1.12, -10)
    .sharpen({ sigma: 1.2, m1: 1.0, m2: 2.5 })
    .composite([{ input: vignettePng, blend: 'multiply' }])
    .webp({ quality: 95 })
    .toFile('public/images/cesar_santos_portrait.webp');

  await sharp('public/images/cesar_santos_portrait.webp')
    .jpeg({ quality: 95 })
    .toFile('public/images/cesar_portrait_graded_view.jpg');

  // Also update cesar_santos_authentic.webp
  await sharp('public/images/cesar_santos_portrait.webp')
    .webp({ quality: 95 })
    .toFile('public/images/cesar_santos_authentic.webp');

  console.log('✅ Created cesar_santos_portrait.webp with 100% original real teeth and professional studio grading!');
}

createProfessionalAuthenticPortraits().catch(err => console.error(err));
