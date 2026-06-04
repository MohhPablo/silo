import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buf) {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function fillRoundedRect(raw, imgW, imgH, x1, y1, x2, y2, r, rVal, gVal, bVal) {
  for (let y = Math.max(0, y1); y < Math.min(imgH, y2); y++) {
    for (let x = Math.max(0, x1); x < Math.min(imgW, x2); x++) {
      let inside = true;
      if (y < y1 + r && x < x1 + r) {
        const dx = x - (x1 + r);
        const dy = y - (y1 + r);
        inside = dx * dx + dy * dy <= r * r;
      } else if (y < y1 + r && x >= x2 - r) {
        const dx = x - (x2 - r);
        const dy = y - (y1 + r);
        inside = dx * dx + dy * dy <= r * r;
      } else if (y >= y2 - r && x < x1 + r) {
        const dx = x - (x1 + r);
        const dy = y - (y2 - r);
        inside = dx * dx + dy * dy <= r * r;
      } else if (y >= y2 - r && x >= x2 - r) {
        const dx = x - (x2 - r);
        const dy = y - (y2 - r);
        inside = dx * dx + dy * dy <= r * r;
      } else if (y < y1 || y >= y2) {
        inside = false;
      }
      if (inside) {
        const off = y * (1 + imgW * 3) + 1 + x * 3;
        raw[off] = rVal;
        raw[off + 1] = gVal;
        raw[off + 2] = bVal;
      }
    }
  }
}

function createPNG(w, h) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const raw = Buffer.alloc(h * (1 + w * 3));

  for (let y = 0; y < h; y++) {
    raw[y * (1 + w * 3)] = 0;
    for (let x = 0; x < w; x++) {
      const off = y * (1 + w * 3) + 1 + x * 3;
      raw[off] = 10;
      raw[off + 1] = 10;
      raw[off + 2] = 10;
    }
  }

  const barW = w * 0.28;
  const barH = h * 0.22;
  const radius = w * 0.12;
  const centerX = w / 2;
  const centerY = h * 0.42;

  const topY = centerY - barH * 0.55;
  const botY = centerY + barH * 0.55 - barH;
  const leftX = centerX - barW / 2;
  const rightX = centerX + barW / 2;

  fillRoundedRect(raw, w, h, leftX, topY, rightX, topY + barH, radius, 0xf5, 0xa6, 0x23);
  fillRoundedRect(raw, w, h, leftX, botY, rightX, botY + barH, radius, 0xf5, 0xa6, 0x23);

  fillRoundedRect(raw, w, h, centerX - barW * 0.16, topY + barH - radius * 0.3, centerX + barW * 0.16, botY + radius * 0.3, w * 0.04, 0xf5, 0xa6, 0x23);

  const nameY = centerY + barH + h * 0.08;
  const dotRadius = w * 0.016;

  // Simple small accent circle below the icon as a branding touch
  for (let y = Math.max(0, Math.floor(nameY - dotRadius)); y < Math.min(h, Math.ceil(nameY + dotRadius)); y++) {
    for (let x = Math.max(0, Math.floor(centerX - dotRadius)); x < Math.min(w, Math.ceil(centerX + dotRadius)); x++) {
      const dx = x - centerX;
      const dy = y - nameY;
      if (dx * dx + dy * dy <= dotRadius * dotRadius) {
        const off = y * (1 + w * 3) + 1 + x * 3;
        raw[off] = 0xf5;
        raw[off + 1] = 0xa6;
        raw[off + 2] = 0x23;
      }
    }
  }

  const compressed = deflateSync(raw);

  return Buffer.concat([
    sig,
    createChunk('IHDR', ihdr),
    createChunk('IDAT', compressed),
    createChunk('IEND', Buffer.alloc(0)),
  ]);
}

const outDir = 'public/splash';
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

// Most common iPhone logical screen sizes (at 3x for retina)
const sizes = [
  [1290, 2796], // iPhone 14 Pro Max
  [1179, 2556], // iPhone 14 Pro
  [1284, 2778], // iPhone 12 Pro Max
  [1170, 2532], // iPhone 14 / 13
  [1125, 2436], // iPhone X / 11 Pro / 12 mini
  [828, 1792],  // iPhone 11 / XR
  [750, 1334],  // iPhone SE / 8
];

for (const [w, h] of sizes) {
  const png = createPNG(w, h);
  const filename = `splash-${w}x${h}.png`;
  writeFileSync(`${outDir}/${filename}`, png);
  console.log(`Created ${filename} (${w}x${h}, ${png.length} bytes)`);
}
