const fs = require('fs');
const path = require('path');

// Create a simple SVG icon that can be converted to PNG
const createSVGIcon = (size) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#2563eb" rx="${size * 0.1}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">E</text>
</svg>`;
};

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Icon sizes needed for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Generate SVG icons (browsers can use these as PNG alternatives)
sizes.forEach(size => {
  const svgContent = createSVGIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  fs.writeFileSync(path.join(iconsDir, filename), svgContent);
  console.log(`Created ${filename}`);
});

// Create a simple PNG-like icon using data URL (fallback)
const createDataURLIcon = (size) => {
  // This creates a simple colored square as a data URL
  const canvas = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="#2563eb" rx="${size * 0.1}"/>
    <text x="50%" y="50%" font-family="Arial" font-size="${size * 0.4}" font-weight="bold" fill="white" text-anchor="middle" dy="0.3em">E</text>
  </svg>`;
  
  return `data:image/svg+xml;base64,${Buffer.from(canvas).toString('base64')}`;
};

// Create a simple manifest with data URLs as fallback
const manifestWithDataURLs = {
  "name": "E-Manage Al-Ishlah",
  "short_name": "E-Manage",
  "description": "Educational Management System for Al-Ishlah",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "icons": sizes.map(size => ({
    "src": createDataURLIcon(size),
    "sizes": `${size}x${size}`,
    "type": "image/svg+xml",
    "purpose": "maskable any"
  }))
};

console.log('Icons created successfully!');
console.log('SVG icons can be used directly by modern browsers.');
console.log('For production, consider converting SVG to PNG using online tools or imagemagick.');
