import torch
from pprint import pprint

torch.set_num_threads(1)

model, utils = torch.hub.load(repo_or_dir='snakers4/silero-vad',
                                model='silero_vad',
                                force_reload=True,
                                onnx=True)

(get_speech_timestamps,
save_audio,
read_audio,
VADIterator,
collect_chunks) = utils

SAMPLING_RATE = 16000

vad_iterator = VADIterator(model, sampling_rate=SAMPLING_RATE)
wav = read_audio(f'test1.wav', sampling_rate=SAMPLING_RATE)

window_size_samples = 512 if SAMPLING_RATE == 16000 else 256

for i in range(0, len(wav), window_size_samples):
    chunk = wav[i: i+ window_size_samples]
    if len(chunk) < window_size_samples:
      break
    speech_dict = vad_iterator(chunk, return_seconds=True)
    if speech_dict:
        print(speech_dict, end=' ')

vad_iterator.reset_states() # reset model states after each audio

