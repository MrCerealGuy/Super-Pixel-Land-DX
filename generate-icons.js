// Generates simple PWA icons (solid green square with "S" pattern) using pure Node.js
const fs = require('fs');
const zlib = require('zlib');

function createPNG(width, height) {
  // Build raw pixel data (RGBA)
  const raw = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    const row = y * (width * 4 + 1);
    raw[row] = 0; // filter byte
    for (let x = 0; x < width; x++) {
      const i = row + 1 + x * 4;
      const cx = x / width, cy = y / height;
      // Green gradient: #0f380f (dark) to #306230 (light)
      const t = (Math.sin(cx * 12) * 0.5 + 0.5) * (Math.sin(cy * 12) * 0.5 + 0.5);
      raw[i] = Math.round(0x0f + (0x30 - 0x0f) * t);     // R
      raw[i+1] = Math.round(0x38 + (0x62 - 0x38) * t);    // G
      raw[i+2] = Math.round(0x0f + (0x30 - 0x30) * t);    // B
      raw[i+3] = 255; // A
    }
  }
  return Buffer.from(raw);
}

function deflate(data) {
  return zlib.deflateSync(data, { level: 9 });
}

function crc32(buf) {
  let c = 0xffffffff;
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let cn = n;
    for (let k = 0; k < 8; k++) cn = cn & 1 ? 0xedb88320 ^ (cn >>> 1) : cn >>> 1;
    table[n] = cn;
  }
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeB = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeB, data]);
  const crcV = Buffer.alloc(4);
  crcV.writeUInt32BE(crc32(crcData));
  return Buffer.concat([len, typeB, data, crcV]);
}

function makePNG(width, height) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const raw = createPNG(width, height);
  const idat = deflate(raw);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

const sizes = [192, 512];
for (const s of sizes) {
  const png = makePNG(s, s);
  fs.writeFileSync(`icon-${s}.png`, png);
  console.log(`Generated icon-${s}.png (${png.length} bytes)`);
}
