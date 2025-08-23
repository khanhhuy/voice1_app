--gpus all --served-model-name "higgs-audio-v2-generation-3B-base" --model "bosonai/higgs-audio-v2-generation-3B-base"  --audio-tokenizer-type "bosonai/higgs-audio-v2-tokenizer" --limit-mm-per-prompt audio=50 --max-model-len 8192 --gpu-memory-utilization 0.8 --disable-mm-preprocessor-cache


curl -X POST "http://96.241.192.5:41805/v1/audio/speech" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "higgs-audio-v2-generation-3B-base",
    "voice": "en_woman",
    "input": "Today is a wonderful day to build something people love!",
    "response_format": "pcm"
  }' \
  --output - | ffmpeg -f s16le -ar 24000 -ac 1 -i - speech.wav


python3 generation.py --transcript transcript/sample.txt --seed 12345 --out_path test1.wav

ssh -p 40780 root@96.241.192.5 -L 8080:localhost:8080 -i ~/.ssh/m1_aug_2023

rsync -avz -e "ssh -p 40780 -i ~/.ssh/m1_aug_2023" root@96.241.192.5:/root/higgs-audio/examples/test2.wav ./

scp -P 40780 -i ~/.ssh/m1_aug_2023 ./cartersia_sample.wav root@96.241.192.5:/home/higgs-audio/examples/voice_prompts/

python3 generation.py --transcript transcript/sample.txt --ref_audio cartersia_sample --seed 12345 --out_path test7.wav

python3 generation.py --transcript transcript/sample.txt --ref_audio profile:male_en_british --seed 12345 --out_path test4.wav

python3 generation.py --transcript transcript/sample.txt --ref_audio profile:female_en_story --seed 12345  --temperature 0.3   --out_path test11.wav


## Voice consistency

python3 generation.py \
--scene_prompt scene_prompts/reading_blog.txt \
--transcript transcript/single_speaker/en_higgs_audio_blog.md \
--ref_audio en_man \
--chunk_method word \
--temperature 0.3 \
--generation_chunk_buffer_size 2 \
--seed 12345 \
--out_path generation.wav