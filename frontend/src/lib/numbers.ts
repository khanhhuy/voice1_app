export function randomUInt32 (): number {
  return Math.floor(Math.random() * 4294967296) // 0 to 2^32 - 1
}

