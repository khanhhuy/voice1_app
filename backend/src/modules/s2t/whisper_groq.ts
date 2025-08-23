import Groq, { toFile } from "groq-sdk";
import { ITranscription } from "@/types";

const groq = new Groq();

function debugSegments(segments: ITranscription[]): void {
  segments.forEach(segment => {
    console.log('&&&&&&&&&&&&&&&&&&&&&&&&')
    console.log(segment.text)
    console.log('avg_logprob: ', segment.avg_logprob)
    console.log('no_speech_prob: ', segment.no_speech_prob)
  })
}

function filterOutNonSpeechSegments(segments: ITranscription[]): ITranscription[] {
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

    const transcription = await groq.audio.transcriptions.create({
      file: await toFile(audioBuffer, 'audio.wav'),
      model,
      response_format: "verbose_json",
      timestamp_granularities: ["segment"],
      language,
      temperature,
    });

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

    const filteredSegments = filterOutNonSpeechSegments(segments)

    return filteredSegments;
  }
}

export const whisperGroq = new WhisperGroq();
