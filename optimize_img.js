import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const imagesDir = 'public/images';

async function optimizeImages() {
  console.log('🚀 Iniciando optimización de imágenes a WebP...\n');
  const files = fs.readdirSync(imagesDir);

  let totalOriginal = 0;
  let totalOptimized = 0;

  for (const file of files) {
    if (file.endsWith('.jpg') || file.endsWith('.jpeg')) {
      const filePath = path.join(imagesDir, file);
      const webpName = file.replace(/\.(jpg|jpeg)$/, '.webp');
      const webpPath = path.join(imagesDir, webpName);

      const stats = fs.statSync(filePath);
      totalOriginal += stats.size;

      // Resize max 1200px width and convert to WebP quality 82
      await sharp(filePath)
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(webpPath);

      const webpStats = fs.statSync(webpPath);
      totalOptimized += webpStats.size;

      const savingPct = (((stats.size - webpStats.size) / stats.size) * 100).toFixed(1);
      console.log(`📸 ${file} (${(stats.size / 1024).toFixed(0)} KB) ➔ ${webpName} (${(webpStats.size / 1024).toFixed(0)} KB) [-${savingPct}%]`);
    }
  }

  console.log(`\n==================================================`);
  console.log(`🎉 OPTIMIZACIÓN COMPLETADA:`);
  console.log(`   Peso Original Total : ${(totalOriginal / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`   Peso WebP Optimizado: ${(totalOptimized / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`   Ahorro Total de Ancho de Banda: -${(((totalOriginal - totalOptimized) / totalOriginal) * 100).toFixed(1)}%`);
  console.log(`==================================================`);
}

optimizeImages();
