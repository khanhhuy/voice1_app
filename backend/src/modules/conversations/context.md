Goal: design a conversation manager that orchestrates the conversation between a user and an assistant.

Background Context: the conversation can start with a user or an assistant. When the user speaks, the client will detect the speech and send the audio chunks to the server. The server will transcribe the audio chunks.
The client will try to detect if the user is done speaking, then it sends a signal to the server.
The server generate a text conversation from the current conversation and send it to an LLM to generate a response.
The response is then sent to a text-to-speech engine to generate the audio which is streamed to the client.

Based on this doc, you and me will try to design a conversation manager in TypeScript.
We'll focus on the architecture but less on the implementation details.

At a high-level:
- There is a state, implemented as a class, that holds all data about the conversation. This state is shared with all the conversation components
- The conversation manager is a loop every X milliseconds that checks the state, synchronously update the state, dispatch the calls to async services
- The async services are transcriber, LLM, text-to-speech, etc... that do some async work and update the state when they are done

First, let's define the state.

```ts
interface ITranscription {
  id: number
  seek: number
  start: number
  end: number
  text: string
  tokens: number[]
  temperature: number
  avg_logprob: number
  compression_ratio: number
  no_speech_prob: number
}

interface IAudioChunk {
  sequence: number
  audioBuffer: Buffer
  timestamp: number
  transcriptions?: ITranscription[]
  text?: string
  status: 'unprocessed' | 'transcribing' | 'transcribed'
}

interface IUserTurn {
  id: string
  type: 'userTurn'
  participantId: string
  chunks: IAudioChunk[]
  cachedText?: string
  status: 'speaking' | 'wait-replying' | 'completed'
  allTranscribed: boolean
}

interface IAssistantTurn {
  id: string
  type: 'assistantTurn'
  participantId: string
  responseToTurnId: string
  repliedText?: string
  speechStreamId: string
  status: 'wait-speaking' | 'generating-text' | 'generated-text' | 'generating-speech' | 'generated-speech' | 'completed' | 'cancelled'
}


interface IConversation {
  sessionId: string
  userTurns: IUserTurn[]
  assistantTurns: IAssistantTurn[]
  startTime: number
  endTime?: number
}

class ConversationState {
  private conversation: IConversation

  // methods to access and update the conversation
}

```


This is the psuedo code for the conversation manager, it contains some scenarios that we need to handle, but not all of them.

```ts

// The audioBuffer contain unprocessed audio chunks, it can contain a signal to indicate the user has stopped speaking. Note that if the user starts speaking again, it'll append audio chunks after the signal.
const audioBuffer = new AudioBuffer()

const conversationState = new ConversationState()

loop(() => {
  // 1. Check the audioBuffer to know the current state. If the last element is a stop speaking signal, it means the user has stopped speaking. Otherwise, it means the user is still speaking.
  //   1.1 If the user is still speaking, check the last user turn. Create a turn if last turn is null. Then push the audio chunks to the current user turn. Init transcriber for these audio chunks. Mark the allTranscribed to false.
  //   1.2 If the user has done speaking, and there are unprocessed audio chunks, push them to the current user turn. Init transcriber for these audio chunks. Move the state to wait-replying.
  //   1.3 If the buffer is empty, do nothing.
  // 
  // The audioBuffer should be empty at this point.
  //
  // 2. Check the last user turn.
  //   2.1 If its state is speaking, check chunks that are not yet transcribing, init transcriber for these chunks.
  //   2.2 If it's wait-replying, if allTranscribed is false, check all chunks again and init transcriber for these chunks that are not yet transcribing
  //   2.3 If it's wait-replying, if allTranscribed is true, do nothing
  //
  // 3. Check the last assistant turn and last user turn
  //   - The turn might be null, or waiting for speaking, or it's replying to an user turn
  //   - If the assistant is generating while the user is speaking, mark the assistant turn as cancelled. And starts a new assistant turn.
  //   - The assistant turn has a responseToTurnId which is the id of the user turn that it's replying to. It needs to be the last user turn. Otherwise, cancel the assistant turn. Then add a new turn
  //   - If the assistant sees the last user turn is wait-replying, it changes the status to generating-text. Then init LLM to generate the text. Then the LLM will update the state to generated-text. Then the assistant will init a textToSpeech service to generate the speech.
  //   - When the speech is generating, the assistant can call a talkToUser service to send the streamId to that service, so it can stream the speech to the user.
  //   - When the is generated, it marks both the assistant turn and the user turn to completed.
  //
})

```
The general idea is that every time the loop runs, if the user is speaking, the assistant is not allowed to speak, if it's speaking, then the assistant turn will be cancelled. The user can speak at any time during the assistant turn. So the code needs to be careful to handle this.

The client can mistakenly send a stop signal, in that case, the user turn will be back to speaking, and the assistant turn will be cancelled if it's generating

The conversation manager calls async services to do the work, but it will never check the return value of the services.
It looks at the state to know if the work is done/running/not yet started. It passes the state to the services.


Based on this doc, revise the state and the conversation manager.
You can ask me more questions if there is any unclear point

