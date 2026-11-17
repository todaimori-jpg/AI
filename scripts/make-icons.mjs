import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const OUT = 'public/icons';
fs.mkdirSync(OUT, { recursive: true });

const AMBER = [232, 179, 90];
const BG = [10, 13, 15];

const crcTable = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buffer) {
  let crc = -1;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function encodePng(width, height, rgba) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const smoothstep = (edge0, edge1, x) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

function makeIcon(size, maskable) {
  const pixels = Buffer.alloc(size * size * 4);
  const scale = maskable ? 0.72 : 1;

  const stroke = (distance, width) => 1 - smoothstep(width / 2 - 0.008, width / 2 + 0.008, Math.abs(distance));
  const fillCircle = (distance, radius) => 1 - smoothstep(radius - 0.008, radius + 0.008, distance);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const nx = ((x + 0.5) / size) * 2 - 1;
      const ny = ((y + 0.5) / size) * 2 - 1;
      const r = Math.hypot(nx, ny);

      let rChannel = BG[0];
      let gChannel = BG[1];
      let bChannel = BG[2];

      const glow = Math.max(0, 1 - r / 1.25) * 0.06;
      rChannel += AMBER[0] * glow;
      gChannel += AMBER[1] * glow;
      bChannel += AMBER[2] * glow;

      const outer = stroke(r - 0.72 * scale, 0.03 * scale) * 0.32;
      const mid = stroke(r - 0.5 * scale, 0.032 * scale) * 0.62;
      const cross = Math.max(
        stroke(nx, 0.02 * scale) * (Math.abs(ny) > 0.16 * scale ? 0.7 : 0),
        stroke(ny, 0.02 * scale) * (Math.abs(nx) > 0.16 * scale ? 0.7 : 0),
      );
      const dot = fillCircle(r, 0.075 * scale);

      const angle = Math.atan2(ny, nx);
      const arcAngle = angle > -Math.PI / 2 && angle < -Math.PI / 5;
      const arc = arcAngle ? stroke(r - 0.5 * scale, 0.075 * scale) * 0.9 : 0;

      const needleDistance = Math.abs(nx * -0.7071 + ny * 0.7071);
      const along = nx * 0.7071 + ny * -0.7071;
      const needle = along > 0 && along < 0.62 * scale ? stroke(needleDistance, 0.018 * scale) * 0.85 : 0;

      const alpha = Math.min(1, outer + mid + cross + arc + needle + dot);
      const coverage = smoothstep(0, 1, alpha);
      rChannel = rChannel * (1 - coverage) + AMBER[0] * coverage;
      gChannel = gChannel * (1 - coverage) + AMBER[1] * coverage;
      bChannel = bChannel * (1 - coverage) + AMBER[2] * coverage;

      const offset = (y * size + x) * 4;
      pixels[offset] = Math.round(rChannel);
      pixels[offset + 1] = Math.round(gChannel);
      pixels[offset + 2] = Math.round(bChannel);
      pixels[offset + 3] = 255;
    }
  }
  return encodePng(size, size, pixels);
}

const targets = [
  { file: 'icon-192.png', size: 192, maskable: false },
  { file: 'icon-512.png', size: 512, maskable: false },
  { file: 'icon-maskable-512.png', size: 512, maskable: true },
  { file: 'icon-180.png', size: 180, maskable: false },
];

for (const target of targets) {
  const png = makeIcon(target.size, target.maskable);
  fs.writeFileSync(path.join(OUT, target.file), png);
  console.log(`${target.file} — ${(png.length / 1024).toFixed(1)} KiB`);
}
