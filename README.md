# LLM Powered Prompt Router

A Node.js and TypeScript service that classifies incoming user prompts and routes each request to a focused expert persona.

The project is designed around a simple idea: do one short, low-cost classification call first, then run a second, specialized generation call based on the selected intent.

## Why This Exists

Most AI assistants struggle when every request goes through one large, generic prompt. This service avoids that by splitting the flow:

1. Classify the request intent.
2. Route to a targeted system prompt.
3. Generate the final response from the correct persona.

This gives better consistency, clearer behavior, and easier maintenance.

## Core Capabilities

- Intent classification with confidence scoring.
- Expert prompt routing for different domains.
- Manual intent override with prefixes like `@code` and `@writing`.
- Fallback behavior for malformed model output.
- JSON Lines route logging for observability.
- REST API, CLI mode, and browser UI entry point.

## Supported Intents

- `code`
- `data`
- `writing`
- `career`
- `unclear`

## Tech Stack

- Node.js 20+
- TypeScript
- Express
- Groq SDK
- Docker and Docker Compose

## Project Layout

```text
src/
  app.ts                 # Express app and routes
  server.ts              # runtime entrypoint
  cli.ts                 # local interactive CLI
  test.ts                # parser and integration tests
  index.ts               # exports
  clients/
    groqClient.ts
    geminiClient.ts
  core/
    classifier.ts        # classifyIntent + parseClassifierResponse
    router.ts            # route and response orchestration
    prompts.json         # persona prompt definitions
  utils/
    logger.ts            # JSONL logging
    constants.ts
    errors.ts
    utils.ts
  middleware/
    middleware.ts
  config/
    config.ts
  types/
    index.ts
    global.d.ts
  public/
    index.html
```

## Prerequisites

- Node.js 20 or newer
- npm
- Groq API key

## Environment Setup

Create your local environment file:

```bash
cp .env.example .env
```

Minimum required variable:

- `GROQ_API_KEY`

Common optional variables:

- `PORT` (default: `3000`)
- `CLASSIFIER_MODEL` (default: `llama-3.1-8b-instant`)
- `GENERATION_MODEL` (default: `llama-3.3-70b-versatile`)
- `CONFIDENCE_THRESHOLD` (default: `0.7`)

## Run Locally

Install dependencies:

```bash
npm install
```

Start in development mode:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Run production build:

```bash
npm start
```

CLI mode:

```bash
npm run cli
```

Tests:

```bash
npm test
```

## API Endpoints

Base URL: `http://localhost:3000`

### POST /chat

Request body:

```json
{
  "message": "Can you review this function for bugs?"
}
```

Response shape:

```json
{
  "intent": "code",
  "confidence": 0.94,
  "response": "...",
  "responseTime": 412
}
```

### POST /api/route

Extended response with persona metadata:

- `intent`
- `confidence`
- `persona`
- `emoji`
- `response`
- `responseTime`

### GET /api/health

Service health and runtime metrics.

### GET /api/logs

Recent route log entries from the JSONL log file.

## Prompt Routing Model

- Persona definitions live in `src/core/prompts.json`.
- `classifyIntent` returns `{ intent, confidence }`.
- Confidence threshold can route low-confidence results to `unclear`.
- For `unclear`, the final response asks a clarifying question.

## Logging

Each handled message appends one JSON object entry with:

- `timestamp`
- `intent`
- `confidence`
- `user_message`
- `final_response`

This keeps logs easy to inspect and parse in downstream tools.

## Docker

Build:

```bash
docker build -t llm-powered-prompt-router:latest .
```

Run:

```bash
docker run -p 3000:3000 --env-file .env llm-powered-prompt-router:latest
```

Compose:

```bash
docker compose up --build
```

## Notes for Evaluators

- Prompts are externalized and keyed by intent.
- Classifier output is parsed defensively with fallback behavior.
- The routing decision and final output are logged for each request.
- API includes both assignment endpoint (`/chat`) and extended endpoint (`/api/route`).

## License

MIT License
