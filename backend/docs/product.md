# Product Overview
Voice1 is a product to let people practice with different AI personas to improve their professional communication skills.
Target audience are product team... that need to communicate with customers on a regular basis.

The product main concept are:

**AI agents**: each agent is a different persona that can be used to practice with e.g. senior product manager, sales manager, customer success manager, etc...
- Some agents are built-in some are custom built by the user
- An agent, from a user perspective, has a name and a prompt described the persona of that agent.
- Internally, the agent always has a system prompt that configure more behavior of the agent.

**Sesssion**: a session is a conversation between the user and the agent.
- It contains the audio, timestamp, and the transcript of the conversation from both sides
- The user can pause then resume the session, but when the session ended it cannot be resumed.
- A session can last maximum 1 hour
- Also contains the usage (audio token, text token) of the session

**User**: a user is a person that uses the product.
Similar to other SaaS, they can have their own settings and subscription.
For now, the product only supports google login and password login.

**Subscription**: a subscription is a link between a user and a plan.
It has a status such as free, active, cancelled, etc...
It also tracks total usage accross all sessions of the user.

**Plan**: free plan, pro plan
A plan has a maximum quota, and the quota can have different types: audio token, text token

# Usage management
Since the product calls LLM platform to generate messages and prompts, token/usage management per user is super important.
A user has a maximum quota, and the usage is tracked in each session.
