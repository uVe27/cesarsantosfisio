import fs from 'node:fs';
import path from 'node:path';

function copyIndexHtml(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== '_astro' && entry.name !== 'node_modules' && entry.name !== 'images' && entry.name !== 'LOGO') {
      const indexFile = path.join(fullPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        const flatHtml = `${fullPath}.html`;
        fs.copyFileSync(indexFile, flatHtml);
        console.log(`Generated ${flatHtml}`);
      }
      copyIndexHtml(fullPath);
    }
  }
}

copyIndexHtml('./dist');
console.log('Postbuild: Created flat .html fallback files successfully.');
