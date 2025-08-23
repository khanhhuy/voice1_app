# Tech stack
- Backend: Node.js, Express, PostgreSQL, Redis, Sequelize
- TypeScript
- AI services:
  - Grok for text generation
  - Inworld AI for text to speech generation
- Hosting provider: DigitalOcean

## Storage
Audio blob of a session is stored in DigitalOcean Spaces (S3 compatible)
The database holds a record about the metdata of the audio blob

In the future, we may store video blob as well.

## File structure
- src/controllers: contains the controllers (Express) and web socket handlers
- src/models: sequelize models and database related code
- src/services: standalone services, technical services (as opposed to business logic), can be used by any module
- src/modules: each module is a business logic module that contains logic around that functionality

A typical request flow starts at the controller layer to process the params then call appropriate module to handle the request.
