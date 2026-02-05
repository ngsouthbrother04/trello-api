# Author

**ngsouthbrother04** - [GitHub](https://github.com/ngsouthbrother04)

# Trello API

Tech snapshot
- Node.js (ES modules) + Babel
- Express 4.x
- MongoDB native driver
- Joi validation
- socket.io for invitation events

Quick start

1. Create a `.env` based on `src/config/environment.js`:

```env
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=trello-db
LOCAL_DEV_APP_HOST=localhost
LOCAL_DEV_APP_PORT=8017
BUILD_MODE=dev
```

2. Install and run in dev:

```bash
yarn install
yarn dev
```

Production build:

```bash
yarn build
yarn production
```

## Core architecture notes
- Entry: `src/server.js` — registers middleware, routes and socket.io. Use `server.listen` (not `app.listen`) because sockets are attached to an HTTP server.
- Routes: `src/routes/v1` — API surface; prefer adding new endpoints here.
- Controllers: thin, handle `req`/`res` and call services. See `src/controllers/boardController.js`.
- Services: business rules + orchestration across models/providers. Add unit tests here.
- Models: use `GET_DB()` from `src/config/mongodb.js`. No Mongoose — work with `ObjectId` manually.

## Where to look for examples
- Board lifecycle: `src/controllers/boardController.js` → `src/services/boardService.js` → `src/models/boardModel.js`.
- Column/card behavior: `src/models/columnModel.js`, `src/models/cardModel.js`.
- Invitation + socket flow: `src/sockets/invitationUserToBoardSocket.js` and `src/services/invitationService.js`.

## Extending the project
- Tests: no tests present—place tests under `test/` and add scripts to `package.json`.
- Transactions: this project currently uses ordered updates; if you require atomic cross-collection operations, add MongoDB sessions and transactions.
