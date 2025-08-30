import { ITranscription } from '@/types'
import fs from 'fs'
import { DateTime } from 'luxon'

/**
 * A logger service to debug conversation_manager
 */

interface ILogRawAudioChunk {
  type: 'raw-audio-chunk',
  sessionId: string,
  ts: number
}

interface ILogVAD {
  type: 'vad',
  sessionId: string,
  ts: number,
  status: 'start-speech' | 'end-speech' | 'speech'
}

interface ILogTranscriptionEvent {
  type: 'transcription-event',
  sessionId: string,
  startTime: number,
  endTime: number,
  transcriptions: ITranscription[]
}

type LogEvent = ILogRawAudioChunk | ILogVAD | ILogTranscriptionEvent

const CONVO_LOG_FILE = 'logs/convo.log'

function formatTime(ts: number) {
  const dt = DateTime.fromMillis(ts)
  return dt.toFormat('mm:ss.SSS')
}

export class ConvoLogger {
  private eventsRawAudioChunk: ILogRawAudioChunk[] = []
  private eventsVAD: ILogVAD[] = []
  private eventsTranscriptionEvent: ILogTranscriptionEvent[] = []

  constructor() {
    if (!fs.existsSync(CONVO_LOG_FILE)) {
      fs.writeFileSync(CONVO_LOG_FILE, '')
    }
  }

  log(event: LogEvent) {
    switch (event.type) {
      case 'raw-audio-chunk':
        this.eventsRawAudioChunk.push(event)
        break
      case 'vad':
        this.eventsVAD.push(event)
        break
      case 'transcription-event':
        this.eventsTranscriptionEvent.push(event)
        break
    }
  }

  start() {
    setInterval(() => {
      this.writeToFile(this.render())
    }, 200)
  }

  render() {
    return `
---------------------------------------
Audio chunks --------------------------
---------------------------------------
${this.renderRawAudioChunkLog()}


---------------------------------------
VAD -----------------------------------
---------------------------------------
${this.renderVADLog()}

---------------------------------------
Transcription events ------------------
---------------------------------------
${this.renderTranscriptionEventLog()}
    `
  }

  renderRawAudioChunkLog() {
    let totalSessionTimeSecs = 0
    if (this.eventsRawAudioChunk.length > 0) {
      totalSessionTimeSecs = this.eventsRawAudioChunk[this.eventsRawAudioChunk.length - 1].ts - this.eventsRawAudioChunk[0].ts
      totalSessionTimeSecs = totalSessionTimeSecs / 1000
    }

    let receivingRate = 0
    // only use the latest 5 chunks to calculate the receiving rate
    if (totalSessionTimeSecs > 5) {
      const total5ChunksTime = this.eventsRawAudioChunk[this.eventsRawAudioChunk.length - 1].ts - this.eventsRawAudioChunk[this.eventsRawAudioChunk.length - 5].ts
      receivingRate = total5ChunksTime / 5.0
    }

    return `Total raw chunks: ${this.eventsRawAudioChunk.length}\n` + 
           `Total session time: ${Math.round(totalSessionTimeSecs * 100) / 100.0} seconds\n` + 
           `Receiving rate (last 5): ${Math.round(receivingRate)} ms/chunk\n`
  }

  renderVADLog() {
    let segments = ''

    // [01:30.444 -> 01:30.444]  [01:30.444 -> 01:30.444], ...
    for (let i = 0; i < this.eventsVAD.length; i++) {
      if (this.eventsVAD[i].status === 'start-speech') {
        segments += `[${formatTime(this.eventsVAD[i].ts)} -> `
      } else if (this.eventsVAD[i].status === 'end-speech') {
        segments += `${formatTime(this.eventsVAD[i].ts)}]  `
      }
    }

    return `Segments: ${segments}\n`
  }

  renderTranscriptionEventLog() {
    let segments = ''
    // [01:30.444 -> 01:30.444]
    for (let i = 0; i < this.eventsTranscriptionEvent.length; i++) {
      const event = this.eventsTranscriptionEvent[i]
      segments += `[${formatTime(event.startTime)} -> ${formatTime(event.endTime)}]`
      if (event.transcriptions.length === 0) {
        segments += 'F '
      } else {
        segments += '  '
      }
    }
    return `Total transcription events: ${this.eventsTranscriptionEvent.length}\n` + 
           `Segments: ${segments}\n`
  }


  writeToFile(content: string) {
    // truncate then write new content
    fs.writeFile(CONVO_LOG_FILE, content, (err) => {
      if (err) {
        console.error('Error writing to convo log file', err)
      }
    })
  }
}
