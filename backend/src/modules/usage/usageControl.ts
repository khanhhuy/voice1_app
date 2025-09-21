import { IUsage } from "@/core/types/core";

function defaultUsage(): IUsage.Usage {
  return {
    whisperGroq: {
      speechDuration: 0,
      nonSpeechDuration: 0,
    },
    claude: {
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: 0,
      input_tokens: 0,
      output_tokens: 0,
    },
    voiceInworld: {
      speechDuration: 0,
      canceledDuration: 0,
    },
  }
}

class UsageControl {
  private usage: IUsage.Usage
  private quota: IUsage.Quota

  constructor(usage: IUsage.Usage, quota: IUsage.Quota) {
    this.usage = usage
    this.quota = quota
  }

  updateUsage(usage: Partial<IUsage.Usage>) {
    if (usage.whisperGroq) {
      const currentWhisper = this.usage.whisperGroq
      this.usage.whisperGroq = {
        speechDuration: currentWhisper.speechDuration + usage.whisperGroq.speechDuration,
        nonSpeechDuration: currentWhisper.nonSpeechDuration + usage.whisperGroq.nonSpeechDuration,
      }
    }

    if (usage.claude) {
      const currentClaude = this.usage.claude
      this.usage.claude = {
        cache_creation_input_tokens: currentClaude.cache_creation_input_tokens + usage.claude.cache_creation_input_tokens,
        cache_read_input_tokens: currentClaude.cache_read_input_tokens + usage.claude.cache_read_input_tokens,
        input_tokens: currentClaude.input_tokens + usage.claude.input_tokens,
        output_tokens: currentClaude.output_tokens + usage.claude.output_tokens,
      }
    }

    if (usage.voiceInworld) {
      const currentVoiceInworld = this.usage.voiceInworld
      this.usage.voiceInworld = {
        speechDuration: currentVoiceInworld.speechDuration + usage.voiceInworld.speechDuration,
        canceledDuration: currentVoiceInworld.canceledDuration + usage.voiceInworld.canceledDuration,
      }
    }
  }

  updateTranscriptionUsage(speechDuration: number, nonSpeechDuration: number) {
    this.usage.whisperGroq.speechDuration += speechDuration
    this.usage.whisperGroq.nonSpeechDuration += nonSpeechDuration
  }

  getUsage() {
    return this.usage
  }

  printUsage() {
    console.log('Usage:', JSON.stringify(this.usage, null, 2))
  }
}

export { UsageControl, defaultUsage }