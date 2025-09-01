import { DEDUP_PROMPT } from "./dedup_prompt_short"
import { Groq } from "groq-sdk"

const groq = new Groq()

async function dedupLLM(pastTranscription: string, combinedTranscription: string): Promise<string> {
  if (pastTranscription.length === 0 || combinedTranscription.length === 0) {
    return ""
  }

  const message = `
Now extract the new segment:
Previous: "${pastTranscription}"
Combined: "${combinedTranscription}"
Output:
  `

  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages: [
      {
        role: "system",
        content: DEDUP_PROMPT
      },
      {
        role: "user",
        content: message,
      },
    ],
  });

  return completion.choices[0].message.content || ""
}

export { dedupLLM }