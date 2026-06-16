const fs = require('fs');
const path = require('path');

const tabbarDir = path.join(__dirname, '../src/static/tabbar');

if (!fs.existsSync(tabbarDir)) {
  fs.mkdirSync(tabbarDir, { recursive: true });
}

function createPNG(width, height, r, g, b, a = 255) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  
  const ihdrChunk = createChunk('IHDR', ihdrData);
  
  const rawData = [];
  for (let y = 0; y < height; y++) {
    rawData.push(0);
    for (let x = 0; x < width; x++) {
      rawData.push(r, g, b, a);
    }
  }
  
  const { deflateSync } = require('zlib');
  const compressed = deflateSync(Buffer.from(rawData));
  const idatChunk = createChunk('IDAT', compressed);
  
  const iendChunk = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  
  const typeBuffer = Buffer.from(type);
  const crcData = Buffer.concat([typeBuffer, data]);
  
  const crc = crc32(crcData);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc >>> 0, 0);
  
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  const table = [];
  
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  
  return crc ^ 0xFFFFFFFF;
}

const icons = [
  { name: 'home.png', color: [134, 134, 139] },
  { name: 'home-active.png', color: [0, 122, 255] },
  { name: 'record.png', color: [134, 134, 139] },
  { name: 'record-active.png', color: [0, 122, 255] },
  { name: 'friends.png', color: [134, 134, 139] },
  { name: 'friends-active.png', color: [0, 122, 255] },
  { name: 'profile.png', color: [134, 134, 139] },
  { name: 'profile-active.png', color: [0, 122, 255] },
];

icons.forEach(icon => {
  const png = createPNG(48, 48, icon.color[0], icon.color[1], icon.color[2], 255);
  fs.writeFileSync(path.join(tabbarDir, icon.name), png);
  console.log(`Created: ${icon.name}`);
});

console.log('All icons created!');
