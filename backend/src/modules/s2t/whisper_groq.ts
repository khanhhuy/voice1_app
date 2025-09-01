import Groq, { toFile } from "groq-sdk";
import { ITranscription } from "@/types";

const groq = new Groq();

/**
 * Adds WAV header to raw PCM audio data
 * @param pcmData Raw PCM audio data as Buffer
 * @param sampleRate Sample rate of the audio (default: 16000)
 * @param numChannels Number of audio channels (default: 1)
 * @param bitsPerSample Bits per sample (default: 16)
 * @returns Buffer with WAV header
 */
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

function debugSegments(segments: ITranscription[]): void {
  segments.forEach(segment => {
    console.log('&&&&&&&&&&&&&&&&&&&&&&&&')
    console.log(segment.text)
    console.log('avg_logprob: ', segment.avg_logprob)
    console.log('no_speech_prob: ', segment.no_speech_prob)
  })
}

export function filterOutNonSpeechSegments(segments: ITranscription[]): ITranscription[] {
  return segments.filter(segment => {
    return segment.no_speech_prob <= 0.5 && Math.abs(segment.avg_logprob) <= 0.5
  })
}

export class WhisperGroq {
  /**
   * Transcribe audio buffer using Groq's Whisper API
   * @param audioBuffer The audio data as Buffer
   * @param options Optional configuration for transcription
   * @returns Promise<ITranscription[]> Array of transcription segments
   */
  async transcribe(
    audioBuffer: Buffer,
    options: {
      language?: string;
      temperature?: number;
      model?: string;
    } = {}
  ): Promise<ITranscription[]> {
    const {
      language = "en",
      temperature = 0.0,
      model = "whisper-large-v3"
    } = options;

    // Add WAV header to raw audio data
    const wavBuffer = addWavHeader(audioBuffer);
    
    const transcription = await groq.audio.transcriptions.create({
      file: await toFile(wavBuffer, 'audio.wav'),
      model,
      response_format: "verbose_json",
      timestamp_granularities: ["word"],
      language,
      temperature,
    });

    console.log('transcription', transcription)

    // Convert Groq response to our ITranscription format
    const segments: ITranscription[] = (transcription as any).segments?.map((segment: any) => ({
      id: segment.id,
      seek: segment.seek,
      start: segment.start,
      end: segment.end,
      text: segment.text,
      tokens: segment.tokens,
      temperature: segment.temperature,
      avg_logprob: segment.avg_logprob,
      compression_ratio: segment.compression_ratio,
      no_speech_prob: segment.no_speech_prob,
    })) || [];

    // debugSegments(segments)

    return segments;
  }
}

export const whisperGroq = new WhisperGroq();
