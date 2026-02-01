// Simple script to create PWA icon placeholders
// Run this with: node scripts/create-pwa-icons.js

const fs = require('fs');
const path = require('path');

// SVG template for the brain icon
const createSVG = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
  <text x="50%" y="55%" font-size="${size * 0.5}" text-anchor="middle" dominant-baseline="middle">🧠</text>
</svg>`;

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const publicDir = path.join(__dirname, '..', 'public');

console.log('Creating PWA icons...');

sizes.forEach(size => {
  const svg = createSVG(size);
  const filename = path.join(publicDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(filename, svg);
  console.log(`Created: icon-${size}x${size}.svg`);
});

// Create a simple screenshot placeholder
const screenshotWide = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f3e8ff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#fce7f3;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#bg)"/>
  <text x="640" y="320" font-size="64" font-family="Arial, sans-serif" font-weight="bold" fill="#8b5cf6" text-anchor="middle">MemoSphere</text>
  <text x="640" y="400" font-size="32" font-family="Arial, sans-serif" fill="#6b7280" text-anchor="middle">Your Personal Digital Assistant</text>
</svg>`;

const screenshotNarrow = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1280" viewBox="0 0 720 1280">
  <defs>
    <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f3e8ff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#fce7f3;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="720" height="1280" fill="url(#bg2)"/>
  <text x="360" y="600" font-size="48" font-family="Arial, sans-serif" font-weight="bold" fill="#8b5cf6" text-anchor="middle">MemoSphere</text>
  <text x="360" y="680" font-size="24" font-family="Arial, sans-serif" fill="#6b7280" text-anchor="middle">Your Personal Digital Assistant</text>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'screenshot-wide.svg'), screenshotWide);
fs.writeFileSync(path.join(publicDir, 'screenshot-narrow.svg'), screenshotNarrow);

console.log('Created screenshot placeholders');
console.log('\\nDone! For production, convert these SVGs to PNGs using an image converter.');
