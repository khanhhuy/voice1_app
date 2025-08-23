async function buildAudioChunk (sessionId: string, sequence: number, audioData: Blob): Promise<Uint8Array> {
  const arrayBuffer = await audioData.arrayBuffer()
  const payloadLength = arrayBuffer.byteLength

  // Create 12-byte header: 4 bytes sessionId + 4 bytes sequence + 4 bytes payload length
  const header = new ArrayBuffer(12)
  const headerView = new DataView(header)
  headerView.setUint32(0, parseInt(sessionId, 10), false)
  headerView.setUint32(4, sequence, false)
  headerView.setUint32(8, payloadLength, false)
  
  // Combine header and payload
  const fullMessage = new Uint8Array(12 + payloadLength)
  fullMessage.set(new Uint8Array(header), 0)
  fullMessage.set(new Uint8Array(arrayBuffer), 12)
  
  return fullMessage
}

export {
  buildAudioChunk,
}