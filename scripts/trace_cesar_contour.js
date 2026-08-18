import sharp from 'sharp';

async function traceContour() {
  const { data, info } = await sharp('C:/Users/masth/.gemini/antigravity-cli/brain/d1794d72-a330-47b6-a8a2-c9c4ee45b674/crop_cesar_perfect.jpg')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const W = info.width;
  const H = info.height;
  console.log('Image size:', W, H);

  // Scan horizontal rows from y = 140 to 600 to find head & neck contour
  const leftContour = [];
  const rightContour = [];

  for (let y = 140; y < 700; y += 10) {
    let lx = 0, rx = W - 1;
    // Scan from center outwards
    const cx = 425;
    // Find left edge: scan from cx leftwards until we hit background
    for (let x = cx; x >= 0; x--) {
      const idx = (y * W + x) * 3;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      // Background ceiling (r>160, g>160, b>160) or closet (wood brown: r: 90-140, g: 70-110, b: 50-85, r > g + 15)
      // Hair is dark (r<70, g<70, b<70), skin is warm (r>110, g>70, b>50)
      if (y < 350 && (r > 150 && g > 150 && b > 150)) {
        lx = x + 1;
        break;
      }
      if (y >= 350 && y < 550 && (r > 90 && g > 65 && b < 85 && r > b + 25)) {
        lx = x + 1;
        break;
      }
      if (x === 0) lx = 0;
    }

    // Find right edge: scan from cx rightwards until we hit background doorway
    for (let x = cx; x < W; x++) {
      const idx = (y * W + x) * 3;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      // Ceiling top right (r>160, g>160, b>160) or doorway dark (r<35, g<35, b<35)
      if (y < 350 && (r > 140 && g > 140 && b > 140)) {
        rx = x - 1;
        break;
      }
      if (y >= 350 && y < 550 && (r < 40 && g < 40 && b < 40)) {
        rx = x - 1;
        break;
      }
      if (x === W - 1) rx = W - 1;
    }

    leftContour.push({ x: lx, y });
    rightContour.push({ x: rx, y });
  }

  console.log('Sample Left Contour:', leftContour.slice(0, 15));
  console.log('Sample Right Contour:', rightContour.slice(0, 15));
}

traceContour().catch(err => console.error(err));
