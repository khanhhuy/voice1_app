# Grow API documentation

## API Reference
```js
import fs from "fs";
import Groq from "groq-sdk";

// Initialize the Groq client
const groq = new Groq();

async function main() {
  // Create a transcription job
  const transcription = await groq.audio.transcriptions.create({
    file: fs.createReadStream("YOUR_AUDIO.wav"), // Required path to audio file - replace with your audio file!
    model: "whisper-large-v3", // Required model to use for transcription
    response_format: "verbose_json", // Optional
    timestamp_granularities: ["segment"], // Optional (must set response_format to "json" to use and can specify "word", "segment" (default), or both)
    language: "en",
    temperature: 0.0,
  });
  // To print only the transcription text, you'd use console.log(transcription.text); (here we're printing the entire transcription object to access timestamps)
  console.log(JSON.stringify(transcription, null, 2));
}
main();
```

## Understanding Metadata Fields
When working with Groq API, setting response_format to verbose_json outputs each segment of transcribed text with valuable metadata that helps us understand the quality and characteristics of our transcription, including avg_logprob, compression_ratio, and no_speech_prob.

This information can help us with debugging any transcription issues. Let's examine what this metadata tells us using a real example:

```json
{
  "id": 8,
  "seek": 3000,
  "start": 43.92,
  "end": 50.16,
  "text": " document that the functional specification that you started to read through that isn't just the",
  "tokens": [51061, 4166, 300, 264, 11745, 31256],
  "temperature": 0,
  "avg_logprob": -0.097569615,
  "compression_ratio": 1.6637554,
  "no_speech_prob": 0.012814695
}
```

As shown in the above example, we receive timing information as well as quality indicators. Let's gain a better understanding of what each field means:
- id:8: The 9th segment in the transcription (counting begins at 0)
- seek: Indicates where in the audio file this segment begins (3000 in this case)
- start and end timestamps: Tell us exactly when this segment occurs in the audio (43.92 to 50.16 seconds in our example)
- avg_logprob (Average Log Probability): -0.097569615 in our example indicates very high confidence. Values closer to 0 suggest better confidence, while more negative values (like -0.5 or lower) might indicate transcription issues.
- no_speech_prob (No Speech Probability): 0.0.012814695 is very low, suggesting this is definitely speech. Higher values (closer to 1) would indicate potential silence or non-speech audio.
- compression_ratio: 1.6637554 is a healthy value, indicating normal speech patterns. Unusual values (very high or low) might suggest issues with speech clarity or word boundaries.

## Using Metadata for Debugging
When troubleshooting transcription issues, look for these patterns:

Low Confidence Sections: If avg_logprob drops significantly (becomes more negative), check for background noise, multiple speakers talking simultaneously, unclear pronunciation, and strong accents. Consider cleaning up the audio in these sections or adjusting chunk sizes around problematic chunk boundaries.
Non-Speech Detection: High no_speech_prob values might indicate silence periods that could be trimmed, background music or noise, or non-verbal sounds being misinterpreted as speech. Consider noise reduction when preprocessing.
Unusual Speech Patterns: Unexpected compression_ratio values can reveal stuttering or word repetition, speaker talking unusually fast or slow, or audio quality issues affecting word separation.
Quality Thresholds and Regular Monitoring
We recommend setting acceptable ranges for each metadata value we reviewed above and flagging segments that fall outside these ranges to be able to identify and adjust preprocessing or chunking strategies for flagged sections.

By understanding and monitoring these metadata values, you can significantly improve your transcription quality and quickly identify potential issues in your audio processing pipeline.


## Improve transcription quality

The src/modules/s2t/transcriptionService.ts receives raw audio buffer and sends it to whisperGroq
(src/modules/s2t/whisperGroq.ts) to transcribe the audio

The problem is sometime the audio buffer is too short, and since whisperGroq calls a stateles API, the result is not accurate.
E.g. " And my customer service team is", "finding". The user somehow pauses before saying "finding", so the audio buffer for
"finding" is too short.

The idea is is to send a long enough buffer to whisper, so buffers = past_buffers + current_buffer
Example:
- Buffer 1: " And my customer service team is"
  => Transcription: " And my customer service team is"
- Buffer 2: " And my customer service team is finding"
  => Transcription: " And my customer service team is finding"
- Buffer 3: " And my customer service team is finding the right product to experiment"
  => Transcription: " And my customer service team is finding the right product to experiment"
- Buffer 4: "finding the right product to experiment with my clients"

The problems with this approach are:
1. Whisper does not return the start and end time for each word in the transcription
This means for a result, we cannot tell which word belongs to which buffer

2. The past buffer when concatenated with the current buffer might give different transcription than the past buffer alone
Combine with 1., we cannot use the past transcription result and do string comparison to remove the past buffer from the result

The 1st strategy is to always discard the past buffer if we receive a better result from the current run
But the result of the past buffer is already sent to next phase, so we cannot discard it. We can wait, but due to 3., we never know if we have the "next" buffer or not

- Use a fixed delay can be a solution, finding the correct delay might require some experimentation

This is complex because the previous 1 buffer might be too short, so we might need to have X previous buffers, which complicates the whole process

The 2nd strategy is try to overcome 2. by using fuzzy string matching to remove the past buffer from the result


### Delay strategy
The src/modules/s2t/transcriptionService.ts receives raw audio buffer and sends it to whisperGroq
(src/modules/s2t/whisperGroq.ts) to transcribe the audio

The problem is sometime the audio buffer is too short, and since whisperGroq calls a stateles API, the result is not accurate.
E.g. " And my customer service team is", "finding". The user somehow pauses before saying "finding", so the audio buffer for
"finding" is too short.

The idea is to use past X buffers to provide more context for the current buffer.
`combined_buffers = past_buffers + current_buffer`

The problem with this is the combined transcription might be different from the past transcription, so we need to call
`dedupLLM(pastTranscription, combinedTranscription)` to get the new transcription.

Modify the transcriptionService to use this new strategy.
- add a new parameter `contextSizeMs` to determine the number of past buffers to use
- store the pairs (buffer, transcription) so that we can build the context and dedup
