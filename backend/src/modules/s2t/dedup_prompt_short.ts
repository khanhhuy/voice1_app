export const DEDUP_PROMPT = `
Extract the new portion from a transcription:

Previous transcription: "{past_transcription}"
Combined transcription (contains previous + new): "{combined_transcription}"

Find where the previous ends in the combined (may have minor variations) and return ONLY what comes after.
`