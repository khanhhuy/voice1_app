Context is: I have a Node server that receives audio wav streamed from the browser. The audio is created by a user who is speaking. I want to detect when the user starts/stops speaking so I can guess if they have ended their turn.

The idea is to user vad silero model to detect when speech starts and stops.

Example from silero docs:
```python
## using VADIterator class

vad_iterator = VADIterator(model, sampling_rate=SAMPLING_RATE)
wav = read_audio(f'en_example.wav', sampling_rate=SAMPLING_RATE)

window_size_samples = 512 if SAMPLING_RATE == 16000 else 256
for i in range(0, len(wav), window_size_samples):
    chunk = wav[i: i+ window_size_samples]
    if len(chunk) < window_size_samples:
      break
    speech_dict = vad_iterator(chunk, return_seconds=True)
    if speech_dict:
        print(speech_dict, end=' ')
vad_iterator.reset_states() # reset model states after each audio
```

The `utils_vad.py` is the implementation of the silero vad repo.

The `vad_server.py` is my implementation that use the `utils_vad.py` to detect speech.

My questions are:
- In `vad_server.py`, can a chunk return multiple [start, end] results?
- In `vad_server.py`, if a chunk is already processed, it won't be processed again but it's still in the model to make the prediction more accurate. Is this correct?

Imagine I have this stream of chunks, 0 means non speech, 1 means speech:
[0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0]

What is the result if I run this chunks through the `vad_server.py`?
