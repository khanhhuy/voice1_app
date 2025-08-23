# Conversation improvements
- when the user speaks when the assistant is speaking, the front-end should detect and stop the audio
  - (optionally) it can send a signal to delete the replied text at the assistant turn after the stop moment
- show the assistant transcript at the front-end

# Features
- [] Conversation history

# Some samples
Sarah (Sales Manager): Good morning, Michael! Thanks for joining us today. Can you see and hear us clearly?
Michael (Client): Yes, perfect. Good morning, Sarah and team.
Sarah: Great! So I have Jake from our technical team and Lisa from customer success with me today. We're excited to discuss how our solution can help streamline your inventory management challenges.
Jake (Technical Lead): Hi Michael. From our preliminary discussion, it sounds like you're dealing with manual tracking across multiple warehouses?
Michael: Exactly. We're spending about 20 hours a week just on inventory reconciliation, and we still have accuracy issues.


Generate audio following instruction.

Generate audio following instruction.

<|scene_desc_start|>

SPEAKER0: She speaks with a clear, natural female voice and an inquiring, slightly cautious tone. Her delivery is conversational and measured, as a customer evaluating options while speaking to a sales representative. The audio is very clear with moderate pacing.

<|scene_desc_end|>

So, um, I'm looking at these warranty plans and... I don't know, maybe I'm overthinking this, but like, what actually happens if my laptop just... dies? Because I had this happen before with my old one and, ugh, the whole process was such a nightmare. Wait, sorry, let me back up - I'm looking at the... what do you call it, the premium plan? And it says something about accidental damage but I'm like, what counts as accidental? Because if I spill coffee on it - which, let's be real, I probably will at some point - does that... oh, and how much is the deductible again? I feel like I saw different numbers on your website versus what my friend told me. She got one of these plans last year but I think it was through a different company? I mean, they all kind of sound the same to me, you know?



Hmm, that makes sense—different cultures can make the small‑talk feel a bit… tricky, right? Maybe start with a light, universal opener—like “How’s the weather where you are?” or “I’ve heard… something positive about their country—does that hold true for you?” It shows you’re curious without getting too deep. You could also share a quick, relatable story from your own locale—something simple, like a recent coffee‑shop find or a local festival you enjoyed—just enough to spark a smile. How about we brainstorm a couple of quick ice‑breakers that feel natural for both sides? What’s one thing you know they enjoy or talk about?
2025-08-09T17:36:51.432Z
generated speech
--------------
2025-08-09T17:37:42.646Z
Human:   yeah they have a new launch new product launch last week so I may use that to  like open the story
2025-08-09T17:37:43.331Z
Assistant: assistant-1754761062645-0.742605747884898
 Okay, that’s a great hook—“Congrats on the launch! … how did it go?”... you could start with something like, “I saw the news about your new product—congrats! I’m curious, what’s been the most exciting part for your team so far?” It’s friendly, shows you’ve done a bit of homework, and opens the door for a casual chat. Then maybe share a quick, related anecdote—like, “We just rolled out a tiny feature here, and the team’s buzzing— reminds me a bit of your rollout vibe.” How does that feel? Anything else you’re hoping to cover in the “casual” part?


Input: 9500
Output: 450


Log:
- Try Kimi K2 and it generates very high quality speech, but the TTS system is currently couldn't handle it well enough
  - Token usage: for 6 minutes convo between me and the AI, it costs (in: 16k tokens, out: 850 tokens). Total: 1.05x input tokens
