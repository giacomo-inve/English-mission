import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../public');

// --- PNG Encoder (Pure JS + Node zlib) ---
function crc32(buf) {
  let table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const toCrc = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(toCrc), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodeRGBAtoPNG(width, height, rgbaBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8-bit
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);
  
  const rawScanlines = Buffer.alloc(height * (1 + width * 4));
  let srcOffset = 0;
  let dstOffset = 0;
  for (let y = 0; y < height; y++) {
    rawScanlines[dstOffset++] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      rawScanlines[dstOffset++] = rgbaBuffer[srcOffset++];
      rawScanlines[dstOffset++] = rgbaBuffer[srcOffset++];
      rawScanlines[dstOffset++] = rgbaBuffer[srcOffset++];
      rawScanlines[dstOffset++] = rgbaBuffer[srcOffset++];
    }
  }
  const compressed = zlib.deflateSync(rawScanlines, { level: 9 });
  
  return Buffer.concat([
    signature,
    createChunk('IHDR', ihdr),
    createChunk('IDAT', compressed),
    createChunk('IEND', Buffer.alloc(0))
  ]);
}

// --- Signed Distance Field Geometry ---
function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.hypot(px - projX, py - projY);
}

function distToRing(px, py, cx, cy, radius) {
  const d = Math.hypot(px - cx, py - cy);
  return Math.abs(d - radius);
}

function distToCircle(px, py, cx, cy, radius) {
  const d = Math.hypot(px - cx, py - cy);
  return d - radius;
}

// Scene SDF evaluation on normalized coordinates [0, 1]
function sceneSDF(x, y) {
  const cx = 0.5, cy = 0.5;
  
  // 1. Telemetry Ring (radius 0.32, stroke half-width 0.011)
  const dRing = distToRing(x, y, cx, cy, 0.32) - 0.011;
  
  // 2. Cardinal Crosshairs (stroke half-width 0.01)
  const dTopTick = distToSegment(x, y, 0.50, 0.10, 0.50, 0.16) - 0.010;
  const dBottomTick = distToSegment(x, y, 0.50, 0.84, 0.50, 0.90) - 0.010;
  const dLeftTick = distToSegment(x, y, 0.10, 0.50, 0.16, 0.50) - 0.010;
  const dRightTick = distToSegment(x, y, 0.84, 0.50, 0.90, 0.50) - 0.010;
  
  // 3. SpaceX 'M' Monogram (stroke half-width 0.018)
  const halfM = 0.019;
  const dM1 = distToSegment(x, y, 0.33, 0.65, 0.33, 0.36) - halfM;
  const dM2 = distToSegment(x, y, 0.33, 0.36, 0.50, 0.52) - halfM;
  const dM3 = distToSegment(x, y, 0.50, 0.52, 0.67, 0.36) - halfM;
  const dM4 = distToSegment(x, y, 0.67, 0.36, 0.67, 0.65) - halfM;
  
  // 4. Spacecraft Orbiter Dot at apex
  const dOrbiter = distToCircle(x, y, 0.50, 0.25, 0.023);
  
  return Math.min(
    dRing,
    dTopTick,
    dBottomTick,
    dLeftTick,
    dRightTick,
    dM1,
    dM2,
    dM3,
    dM4,
    dOrbiter
  );
}

function renderIcon(size) {
  const buf = Buffer.alloc(size * size * 4);
  const pixelSize = 1.0 / size;
  
  let ptr = 0;
  for (let y = 0; y < size; y++) {
    const ny = (y + 0.5) / size;
    for (let x = 0; x < size; x++) {
      const nx = (x + 0.5) / size;
      const d = sceneSDF(nx, ny);
      
      // High-precision smooth anti-aliasing based on pixel boundary
      const alpha = Math.max(0, Math.min(1, 0.5 - d / pixelSize));
      
      // SpaceX black background #000000, white vector symbol #ffffff
      const val = Math.round(alpha * 255);
      
      buf[ptr++] = val;     // R
      buf[ptr++] = val;     // G
      buf[ptr++] = val;     // B
      buf[ptr++] = 255;     // Solid black background with opaque pixels
    }
  }
  return encodeRGBAtoPNG(size, size, buf);
}

// --- Generate SVG ---
function generateSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <rect width="100" height="100" fill="#000000"/>
  <!-- Telemetry Ring -->
  <circle cx="50" cy="50" r="32" stroke="#ffffff" stroke-width="2.2"/>
  <!-- Cardinal Ticks -->
  <line x1="50" y1="10" x2="50" y2="16" stroke="#ffffff" stroke-width="2.0" stroke-linecap="round"/>
  <line x1="50" y1="84" x2="50" y2="90" stroke="#ffffff" stroke-width="2.0" stroke-linecap="round"/>
  <line x1="10" y1="50" x2="16" y2="50" stroke="#ffffff" stroke-width="2.0" stroke-linecap="round"/>
  <line x1="84" y1="50" x2="90" y2="50" stroke="#ffffff" stroke-width="2.0" stroke-linecap="round"/>
  <!-- Spacecraft Orbiter -->
  <circle cx="50" cy="25" r="2.3" fill="#ffffff"/>
  <!-- SpaceX 'M' Monogram -->
  <path d="M 33 65 L 33 36 L 50 52 L 67 36 L 67 65" 
        stroke="#ffffff" 
        stroke-width="3.8" 
        stroke-linecap="round" 
        stroke-linejoin="round"/>
</svg>`;
}

// --- Generate ICO (PNG embedded) ---
function createIcoFromPng(pngBuffer, size = 48) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // ICO type
  header.writeUInt16LE(1, 4); // 1 image
  
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size, 0);  // width
  entry.writeUInt8(size, 1);  // height
  entry.writeUInt8(0, 2);     // color count
  entry.writeUInt8(0, 3);     // reserved
  entry.writeUInt16LE(1, 4);  // color planes
  entry.writeUInt16LE(32, 6); // bpp
  entry.writeUInt32LE(pngBuffer.length, 8); // size of data
  entry.writeUInt32LE(6 + 16, 12);          // offset
  
  return Buffer.concat([header, entry, pngBuffer]);
}

// Generate all target files
console.log('Generating SpaceX PWA assets in', publicDir);

// 1. SVG
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), generateSVG(), 'utf8');
console.log('✓ favicon.svg');

// 2. 512x512 PNG
const png512 = renderIcon(512);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);
console.log('✓ pwa-512x512.png (512x512)');

// 3. 192x192 PNG
const png192 = renderIcon(192);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);
console.log('✓ pwa-192x192.png (192x192)');

// 4. 180x180 Apple Touch Icon PNG
const png180 = renderIcon(180);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), png180);
console.log('✓ apple-touch-icon.png (180x180)');

// 5. 48x48 Favicon ICO
const png48 = renderIcon(48);
const ico = createIcoFromPng(png48, 48);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico);
console.log('✓ favicon.ico');

console.log('All PWA icons generated successfully.');
