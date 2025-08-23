import fs from 'fs';


export function randomUInt32 (): number {
  return Math.floor(Math.random() * 4294967296) // 0 to 2^32 - 1
}

export function saveToDebug (buffer: Buffer) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `audio-debug-${timestamp}.wav`;
  const filepath = `./tmp/${filename}`;
  
  if (!fs.existsSync('./tmp')) {
    fs.mkdirSync('./tmp', { recursive: true });
  }
  
  fs.writeFileSync(filepath, buffer);
}

