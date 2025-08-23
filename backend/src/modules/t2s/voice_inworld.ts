const url = 'https://api.inworld.ai/tts/v1/voice';

async function genSpeech(text: string): Promise<Buffer> {
  const options = {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${process.env.INWORLD_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text,
      voiceId: 'Alex',
      modelId: 'inworld-tts-1',
      temperature: 0.6,
    })
  };

  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json() as { audioContent: string };
  const audioContent = result.audioContent;

  const audioBuffer = Buffer.from(audioContent, 'base64');

  return audioBuffer;
}

export { genSpeech }