import sharp from 'sharp';

async function generateAvatar() {
  const portraitPath = 'public/images/cesar_santos_portrait.webp';

  // Read portrait metadata (896 x 1200)
  // Head is centered horizontally around x: 448
  // Eyes are around y: 370
  // Nose: y: 440
  // Chin: y: 580
  // So face center is x: 448, y: 440
  // Extract 800x800 square with full head headroom and collar
  const avatarBuffer = await sharp(portraitPath)
    .extract({ left: 48, top: 10, width: 800, height: 800 })
    .resize(320, 320)
    .sharpen({ sigma: 1.0, m1: 0.8, m2: 1.5 })
    .webp({ quality: 96 })
    .toBuffer();

  await sharp(avatarBuffer)
    .toFile('public/images/cesar_santos_avatar.webp');

  await sharp(avatarBuffer)
    .jpeg({ quality: 96 })
    .toFile('public/images/cesar_santos_avatar.jpg');

  console.log('✅ Generated dedicated square avatar in public/images/cesar_santos_avatar.webp and .jpg');
}

generateAvatar().catch(err => console.error(err));
