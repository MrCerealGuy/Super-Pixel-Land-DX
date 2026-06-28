// Generates PWA icons (brick block style) using pure Node.js
const fs = require('fs');
const zlib = require('zlib');

function createPNGData(width, height) {
  const raw = Buffer.alloc(height * (width * 4 + 1));
  // GameBoy palette: #0f380f (darkest), #306230 (dark), #8bac0f (mid), #9bbc0f (light)
  function px(y, x, r, g, b) {
    const i = y * (width * 4 + 1) + 1 + x * 4;
    raw[i] = r; raw[i+1] = g; raw[i+2] = b; raw[i+3] = 255;
  }
  for (let y = 0; y < height; y++) {
    const row = y * (width * 4 + 1);
    raw[row] = 0; // filter byte
    for (let x = 0; x < width; x++) {
      // 3px border (darkest green)
      if (x < 3 || y < 3 || x >= width - 3 || y >= height - 3) {
        px(y, x, 15, 56, 15); continue;
      }
      // Normalized coords inside border
      const ix = x - 3, iy = y - 3;
      const iw = width - 6, ih = height - 6;
      // Brick wall: 10px wide, 7px tall, offset every other row
      const brickW = Math.max(10, Math.floor(iw / 8));
      const brickH = Math.max(7, Math.floor(ih / 10));
      const row2 = Math.floor(iy / brickH);
      const offset = (row2 % 2) * (brickW / 2);
      const lx = (ix + offset) % brickW;
      const ly = iy % brickH;
      // Mortar (dark green)
      if (ly < 1 || ly >= brickH - 1 || lx < 1 || lx >= brickW - 1) {
        px(y, x, 48, 98, 48); // #306230
      } else {
        // Brick face (alternating light/mid for depth)
        if ((Math.floor((ix + offset) / brickW) + row2) % 2 === 0) {
          px(y, x, 155, 188, 15); // #9bbc0f (light)
        } else {
          px(y, x, 139, 172, 15); // #8bac0f (mid)
        }
      }
    }
  }
  return raw;
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
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const typeB = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeB, data]);
  const crcV = Buffer.alloc(4); crcV.writeUInt32BE(crc32(crcData));
  return Buffer.concat([len, typeB, data, crcV]);
}

function makePNG(width, height) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const raw = createPNGData(width, height);
  const idat = deflate(raw);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

const sizes = [192, 512];
for (const s of sizes) {
  const png = makePNG(s, s);
  fs.writeFileSync(`icon-${s}.png`, png);
  console.log(`Generated icon-${s}.png (${png.length} bytes)`);
}
