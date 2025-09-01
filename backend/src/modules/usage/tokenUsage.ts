type Model = 'whisper' | 'gpt20b' | 'kimik2'
interface ITokenStorage {
  [userId: string]: {
    [model in Model]: number
  }
}

const STORE: ITokenStorage = {}

function countWhisperTokens(userId: string, segments: { tokens: number }[]) {
  const total = segments.reduce((acc, segment) => acc + segment.tokens, 0)
  addTokenUsage(userId, 'whisper', total)
}

function addTokenUsage(userId: string, model: Model, tokens: number) {
  if (!STORE[userId]) {
    STORE[userId] = {
      whisper: 0,
      gpt20b: 0,
      kimik2: 0
    }
  }


  STORE[userId][model] += tokens
}

function reportTokenUsage(userId: string) {
  const usage = STORE[userId]
  if (!usage) {
    return
  }
  console.log(`Token usage for ${userId}: ${usage.whisper} whisper, ${usage.gpt20b} gpt20b, ${usage.kimik2} kimik2`)
}

export {
  countWhisperTokens,
  addTokenUsage,
  reportTokenUsage
}