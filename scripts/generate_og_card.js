import sharp from 'sharp';
import fs from 'node:fs';

async function generateOGCard() {
  const width = 1200;
  const height = 630;

  // Background SVG with gradient, elegant grid, brand logo and typography
  const svg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#141c20" />
        <stop offset="50%" stop-color="#1c262b" />
        <stop offset="100%" stop-color="#23343a" />
      </linearGradient>
      <linearGradient id="tealGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#5ca1a8" />
        <stop offset="100%" stop-color="#80ced6" />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <!-- Background -->
    <rect width="${width}" height="${height}" fill="url(#bgGrad)" />

    <!-- Subtle accent corner lines -->
    <rect x="30" y="30" width="${width - 60}" height="${height - 60}" fill="none" stroke="rgba(92, 161, 168, 0.25)" stroke-width="2" rx="16" />
    <line x1="30" y1="30" x2="150" y2="30" stroke="#5ca1a8" stroke-width="4" stroke-linecap="round" />
    <line x1="30" y1="30" x2="30" y2="150" stroke="#5ca1a8" stroke-width="4" stroke-linecap="round" />

    <!-- Brand Category Tag -->
    <g transform="translate(80, 110)">
      <rect width="360" height="38" rx="19" fill="rgba(92, 161, 168, 0.15)" stroke="rgba(92, 161, 168, 0.4)" stroke-width="1.5" />
      <text x="180" y="24" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#80ced6" text-anchor="middle" letter-spacing="1.5">FISIOTERAPIA INTEGRATIVA &amp; PNI</text>
    </g>

    <!-- Main Title -->
    <text x="80" y="230" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="800" fill="#ffffff" letter-spacing="-0.5">
      Cesar Santos
    </text>
    <text x="80" y="295" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="700" fill="url(#tealGrad)">
      Fisioterapeuta en Dolor Persistente y Salud
    </text>

    <!-- Value Proposition -->
    <text x="80" y="375" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="400" fill="#a5b5bb">
      Neurobiología del Dolor · Ejercicio Terapéutico Graduado · Psiconeuroinmunología
    </text>
    <text x="80" y="415" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="400" fill="#7a8d95">
      Escuela Universitaria de Fisioterapia de la ONCE (Universidad Autónoma de Madrid)
    </text>

    <!-- Bottom Bar -->
    <line x1="80" y1="480" x2="${width - 80}" y2="480" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1.5" />

    <!-- Website URL -->
    <g transform="translate(80, 530)">
      <circle cx="12" cy="12" r="6" fill="#5ca1a8" />
      <text x="32" y="18" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="700" fill="#ffffff">
        cesarsantos.me
      </text>
    </g>
    
    <text x="${width - 80}" y="548" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="#80ced6" text-anchor="end">
      Evidencia Científica &amp; Salud Activa
    </text>
  </svg>
  `;

  // Overlay brand logo with transparent background
  const logoPath = 'public/LOGO/logo_dark.png';
  let imageBuilder = sharp(Buffer.from(svg));

  if (fs.existsSync(logoPath)) {
    const resizedLogo = await sharp(logoPath)
      .resize({ height: 140 })
      .png()
      .toBuffer();

    imageBuilder = sharp(Buffer.from(svg)).composite([
      {
        input: resizedLogo,
        top: 110,
        left: 900,
      }
    ]);
  }

  await imageBuilder
    .jpeg({ quality: 95 })
    .toFile('public/images/og-default.jpg');

  await sharp('public/images/og-default.jpg')
    .webp({ quality: 95 })
    .toFile('public/images/og-default.webp');

  console.log('✅ Generated public/images/og-default.jpg and .webp (1200x630)');
}

generateOGCard().catch(err => console.error(err));
