# MAVINYR REPOSITORY
## Manual Installation

clone the repo:
```bash
git clone https://github.com/
```
Install the dependencies:

```bash
npm install or yarn install
```
create environment variables:

```bash
cp .env.example .env or mrdir .env
```

set enviroment variables
```bash
# Port number
PORT=5000
# Enviroment of the Node application
NODE_ENV=development
# URL of the Mongo DB
LOCAL_MONGODB_URL=mongodb://127.0.0.1/{dbName}
# URL of the Atlas Mongo DB
```

## Commands

Running locally:

```bash
npm run dev
```

Running in production:

```bash
npm start
```

Compiling to JS from TS

```bash
npm run build
```

## Project Structure

```
.
├── src                             # Source files
│   ├── app.ts                        # Express App
│   ├── config                        # Environment variables and other configurations
│   ├── custom.d.ts                   # File for extending types from node modules
│   ├── declaration.d.ts              # File for declaring modules without types
│   ├── index.ts                      # App entry file
│   ├── modules                       # Modules such as models, controllers, services 
│   └── routes                        # Routes
├── TODO.md                         # TODO List
├── package.json
└── README.md
```

Add your changes to TypeScript(.ts) files which are in the src folder. The files will be automatically compiled to JS if build.

## Logging

Import the logger from `src/config/logger.js`. It is using the [Winston](https://github.com/winstonjs/winston) logging library.

Logging should be done according to the following severity levels (ascending order from most important to least important):

```javascript
const logger = require('<path to src>/config/logger');

logger.error('message'); // level 0
logger.warn('message'); // level 1
logger.info('message'); // level 2
logger.http('message'); // level 3
logger.verbose('message'); // level 4
logger.debug('message'); // level 5
```

In development mode, log messages of all severity levels will be printed to the console.

In production mode, only `info`, `warn`, and `error` logs will be printed to the console.\
It is up to the server (or process manager) to actually read them from the console and store them in log files.\
This app uses pm2 in production mode, which is already configured to store the logs in log files.

Note: API request information (request url, response code, timestamp, etc.) are also automatically logged (using [morgan](https://github.com/expressjs/morgan)).

## Inspirations
-- just for the love of the game.