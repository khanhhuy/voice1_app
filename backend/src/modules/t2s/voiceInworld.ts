import readline from "node:readline";
import { Readable } from "stream";

const url = "https://api.inworld.ai/tts/v1/voice:stream";
const audioConfig = { audio_encoding: "LINEAR16", sample_rate_hertz: 48000 };
const options = {
  method: "POST",
  headers: {
    Authorization: `Basic ${process.env.INWORLD_API_KEY}`,
    "Content-Type": "application/json",
  },
  
};

function getAudioDuration(audioBuffer: Buffer): number {
  // For LINEAR16 at 48kHz: 2 bytes per sample, 48000 samples per second
  const bytesPerSample = 2;
  const sampleRate = audioConfig.sample_rate_hertz;

  // Skip WAV header if present (first 44 bytes)
  const dataStartOffset = audioBuffer.length > 44 ? 44 : 0;
  const audioDataSize = audioBuffer.length - dataStartOffset;

  // Calculate duration in seconds
  const totalSamples = audioDataSize / bytesPerSample;
  return totalSamples / sampleRate;
}

async function streamSpeech (
  text: string,
  onChunkCb: (chunk: Buffer, audioDuration: number) => void,
  onEndCb: () => void
) {
  const response = await fetch(url, {
    ...options,
    body: JSON.stringify({
      text,
      voiceId: "Deborah",
      modelId: "inworld-tts-1",
      audio_config: audioConfig,
    }),
  });

  const lineReader = readline.createInterface({
    input: Readable.fromWeb(response.body as ReadableStream),
    crlfDelay: Infinity,
  });

  for await (const line of lineReader) {
    const chunk = JSON.parse(line);
    const audioBuffer = Buffer.from(chunk.result.audioContent, 'base64');

    // Extract duration from the audio buffer
    const duration = getAudioDuration(audioBuffer);
    

    // Skip WAV header (44 bytes) and send raw PCM
    if (audioBuffer.length > 44) {
      const rawPCM = audioBuffer.slice(44);

      // Send raw PCM data as binary
      onChunkCb(rawPCM, duration);
    }
  }

  onEndCb()
}

export { streamSpeech, getAudioDuration }