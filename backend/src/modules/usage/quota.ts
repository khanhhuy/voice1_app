import { IUsage } from "@/core/types/usage";

const V1_QUOTA: IUsage.Quota = {
  aiSpeechDuration: 300,
  whisperGroq: {
    cost: 1.0,
  },
  claude: {
    cost: 2.0,
  },
  voiceInworld: {
    cost: 2.5,
  }
}

export { V1_QUOTA }