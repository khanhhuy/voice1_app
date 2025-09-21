namespace IUsage {
  export interface Usage {
    whisperGroq: {
      speechDuration: number   
      nonSpeechDuration: number
    },
    claude: {
      cache_creation_input_tokens: number
      cache_read_input_tokens: number
      input_tokens: number
      output_tokens: number
    }
    voiceInworld: {
      speechDuration: number
      canceledDuration: number
    }
  }

  // The idea is the user only need to care
  // about the speech duration, but if they exceed
  // some internal limit, they can be blocked too
  export interface Quota {
    aiSpeechDuration: number
    whisperGroq: {
      cost: number
    },
    claude: {
      cost: number
    },
    voiceInworld: {
      cost: number
    }
  }
}

export type { IUsage }
