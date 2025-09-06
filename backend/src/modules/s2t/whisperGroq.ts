import Groq, { toFile } from "groq-sdk";
import { ITranscriptionFull, ITranscriptionSegment } from "@/types";

const groq = new Groq();

function addWavHeader(
  pcmData: Buffer,
  sampleRate: number = 16000,
  numChannels: number = 1,
  bitsPerSample: number = 16
): Buffer {
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const dataSize = pcmData.length;
  
  // WAV header structure
  const header = Buffer.alloc(44);
  
  // RIFF header
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4); // File size - 8
  header.write('WAVE', 8);
  
  // fmt chunk
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // fmt chunk size
  header.writeUInt16LE(1, 20); // PCM format
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  
  // data chunk
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);
  
  // Combine header and PCM data
  return Buffer.concat([header, pcmData]);
}

export function filterOutNonSpeech(segments: ITranscriptionSegment[]): ITranscriptionSegment[] {
  return segments.filter(segment => segment.no_speech_prob < 0.5 && Math.abs(segment.avg_logprob) < 0.5)
}

export class WhisperGroq {
  async transcribe(
    audioBuffer: Buffer,
    options: {
      language?: string;
      temperature?: number;
      model?: string;
    } = {}
  ): Promise<ITranscriptionSegment[]> {
    const {
      language = "en",
      temperature = 0.0,
      model = "whisper-large-v3"
    } = options;

    // Add WAV header to raw audio data
    const wavBuffer = addWavHeader(audioBuffer);
    
    // const start = Date.now()
    const transcription: ITranscriptionFull = await groq.audio.transcriptions.create({
      file: await toFile(wavBuffer, 'audio.wav'),
      model,
      response_format: "verbose_json",
      timestamp_granularities: ["segment"],
      language,
      temperature,
    }) as unknown as ITranscriptionFull;

    // const end = Date.now()
    // Latency: ~1s when the context is 20 words
    // console.log(`Whisper Groq took ${end - start}ms`)

    const filteredSegments = filterOutNonSpeech(transcription.segments || [])

    return filteredSegments
  }
}

export const whisperGroq = new WhisperGroq();
