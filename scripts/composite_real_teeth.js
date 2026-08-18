import sharp from 'sharp';

async function compositeExactTeeth() {
  const studioImg = sharp('public/images/current_portrait_view.jpg');
  const studioMeta = await studioImg.metadata();
  console.log('Studio meta:', studioMeta.width, 'x', studioMeta.height);

  // In Studio Portrait (1000 x 747):
  // Let's find face dimensions
  // In original photo:
  // We extract the full real mouth, mustache, lips, teeth, and chin
  // from VARIOS/FOTO CESAR.jpg:
  // left: 880, top: 1980, width: 700, height: 420
  
  const mouthExtract = await sharp('VARIOS/FOTO CESAR.jpg')
    .extract({ left: 880, top: 1980, width: 750, height: 420 })
    .resize(270, 151, { fit: 'fill' })
    .modulate({ brightness: 0.95, saturation: 1.05 })
    .toBuffer();

  const maskSvg = Buffer.from(`
    <svg width="270" height="151" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="feather" cx="50%" cy="50%" r="50%">
          <stop offset="40%" stop-color="white" stop-opacity="1" />
          <stop offset="75%" stop-color="white" stop-opacity="0.8" />
          <stop offset="100%" stop-color="white" stop-opacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="135" cy="75" rx="125" ry="65" fill="url(#feather)" />
    </svg>
  `);

  const maskPng = await sharp(maskSvg).png().toBuffer();

  const featheredMouth = await sharp(mouthExtract)
    .composite([{ input: maskPng, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // Overlay mouth directly over the mouth region
  const result = await sharp('public/images/current_portrait_view.jpg')
    .composite([{
      input: featheredMouth,
      top: 305,
      left: 385,
      blend: 'over'
    }])
    .jpeg({ quality: 95 })
    .toFile('public/images/cesar_exact_real_teeth.jpg');

  console.log('Saved cesar_exact_real_teeth.jpg');
}

compositeExactTeeth().catch(err => console.error(err));
