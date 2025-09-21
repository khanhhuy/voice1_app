import Session from "@/models/Session";
import { ISession, IUsage } from "@/core/types/core";

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
  private session: Session

  constructor(session: Session) {
    this.session = session
  }

  updateUsage(usage: Partial<IUsage.Usage>) {
    if (usage.whisperGroq) {
      const currentWhisper = this.session.data.usage.whisperGroq
      this.session.data.usage.whisperGroq = {
        speechDuration: currentWhisper.speechDuration + usage.whisperGroq.speechDuration,
        nonSpeechDuration: currentWhisper.nonSpeechDuration + usage.whisperGroq.nonSpeechDuration,
      }
    }

    if (usage.claude) {
      const currentClaude = this.session.data.usage.claude
      this.session.data.usage.claude = {
        cache_creation_input_tokens: currentClaude.cache_creation_input_tokens + usage.claude.cache_creation_input_tokens,
        cache_read_input_tokens: currentClaude.cache_read_input_tokens + usage.claude.cache_read_input_tokens,
        input_tokens: currentClaude.input_tokens + usage.claude.input_tokens,
        output_tokens: currentClaude.output_tokens + usage.claude.output_tokens,
      }
    }

    if (usage.voiceInworld) {
      const currentVoiceInworld = this.session.data.usage.voiceInworld
      this.session.data.usage.voiceInworld = {
        speechDuration: currentVoiceInworld.speechDuration + usage.voiceInworld.speechDuration,
        canceledDuration: currentVoiceInworld.canceledDuration + usage.voiceInworld.canceledDuration,
      }
    }
  }

  getUsage() {
    return this.session.data.usage
  }

  async refreshSession() {
    const session = await Session.findByPk(this.session.id)
    if (!session) {
      throw new Error('Session not found')
    }
    this.session = session
  }

  printUsage() {
    console.log('Usage:', JSON.stringify(this.session.data.usage, null, 2))
  }
}

export { UsageControl, defaultUsage }