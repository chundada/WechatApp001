// 简易 tabbar 图标生成器
// 生成 81x81 的纯色 PNG 占位图标
// 实际项目中替换为设计师提供的图标

const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

function crc32(buf) {
  let c
  const table = []
  for (let n = 0; n < 256; n++) {
    c = n
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
    }
    table[n] = c
  }
  c = 0xFFFFFFFF
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xFF] ^ (c >>> 8)
  }
  return (c ^ 0xFFFFFFFF) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeB = Buffer.from(type, 'ascii')
  const crcB = Buffer.alloc(4)
  const combined = Buffer.concat([typeB, data])
  crcB.writeUInt32BE(crc32(combined), 0)
  return Buffer.concat([len, typeB, data, crcB])
}

function createSolidPNG(r, g, b) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const width = 81, height = 81

  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(width, 0)
  ihdrData.writeUInt32BE(height, 4)
  ihdrData.writeUInt8(8, 8)
  ihdrData.writeUInt8(2, 9)
  ihdrData.writeUInt8(0, 10)
  ihdrData.writeUInt8(0, 11)
  ihdrData.writeUInt8(0, 12)

  const rawData = []
  for (let y = 0; y < height; y++) {
    rawData.push(0)
    for (let x = 0; x < width; x++) {
      rawData.push(r, g, b)
    }
  }

  const idatData = zlib.deflateSync(Buffer.from(rawData))

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdrData),
    chunk('IDAT', idatData),
    chunk('IEND', Buffer.alloc(0))
  ])
}

const tabbarDir = path.join(__dirname, '..', 'src', 'static', 'tabbar')
if (!fs.existsSync(tabbarDir)) fs.mkdirSync(tabbarDir, { recursive: true })

const icons = [
  { file: 'home.png', r: 134, g: 134, b: 139 },
  { file: 'home-active.png', r: 0, g: 122, b: 255 },
  { file: 'record.png', r: 134, g: 134, b: 139 },
  { file: 'record-active.png', r: 0, g: 122, b: 255 },
  { file: 'friends.png', r: 134, g: 134, b: 139 },
  { file: 'friends-active.png', r: 0, g: 122, b: 255 },
  { file: 'profile.png', r: 134, g: 134, b: 139 },
  { file: 'profile-active.png', r: 0, g: 122, b: 255 },
]

icons.forEach(({ file, r, g, b }) => {
  const png = createSolidPNG(r, g, b)
  fs.writeFileSync(path.join(tabbarDir, file), png)
  console.log(`Created ${file} (${png.length} bytes)`)
})

console.log('All icons generated!')
