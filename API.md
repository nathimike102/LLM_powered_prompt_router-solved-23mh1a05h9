# API Documentation

## Overview

The LLM Powered Prompt Router provides a RESTful API for message routing and intent classification.

## Base URL

```
http://localhost:3000
```

## Endpoints

### POST /api/route

Route a message through the intent classifier and generate an expert response.

**Request**

```json
{
  "message": "How do I sort a list in Python?"
}
```

**Response**

```json
{
  "intent": "code",
  "confidence": 0.95,
  "persona": "Code Expert",
  "emoji": "🧑‍💻",
  "response": "Python lists can be sorted using...",
  "responseTime": 1250
}
```

**Status Codes**

- `200` - Success
- `400` - Invalid request (missing or empty message)
- `500` - Server error

**Error Response**

```json
{
  "error": "A non-empty 'message' string is required in the request body."
}
```

---

### POST /chat

Alias for `/api/route` with simplified response format.

**Request**

```json
{
  "message": "Write me a poem about clouds"
}
```

**Response**

```json
{
  "intent": "writing",
  "confidence": 0.97,
  "response": "Clouds drift across the endless sky...",
  "responseTime": 980
}
```

---

### GET /api/health

Health check endpoint with uptime and metrics.

**Response**

```json
{
  "status": "ok",
  "uptime": 3600000,
  "uptimeSeconds": 3600,
  "metrics": {
    "total": 42,
    "byIntent": {
      "code": 15,
      "data": 8,
      "writing": 12,
      "career": 5,
      "unclear": 2
    },
    "avgResponseTime": 1150,
    "responseTimes": [1200, 1100, 1250, ...]
  }
}
```

---

### GET /api/logs

Retrieve recent log entries from the route log file.

**Query Parameters**

- `limit` (optional, default: 50) - Maximum number of entries to return (1-1000)

**Response**

```json
{
  "logs": [
    {
      "timestamp": "2026-03-12T14:30:45.123Z",
      "intent": "code",
      "confidence": 0.95,
      "user_message": "How do I sort a list in Python?",
      "final_response": "Python lists can be sorted using..."
    },
    ...
  ]
}
```

---

## Intents

The classifier recognizes five intent categories:

| Intent    | Emoji | Description                                         |
| --------- | ----- | --------------------------------------------------- |
| `code`    | 🧑‍💻    | Programming, debugging, APIs, software development  |
| `data`    | 📊    | Data analysis, statistics, calculations, SQL        |
| `writing` | ✍️    | Content creation, proofreading, writing improvement |
| `career`  | 💼    | Job advice, interviews, professional development    |
| `unclear` | 🤔    | Ambiguous or insufficient context                   |

---

## Manual Intent Override

You can manually override the classifier by prefixing your message with `@intent`:

```bash
curl -X POST http://localhost:3000/api/route \
  -H "Content-Type: application/json" \
  -d '{"message": "@code How do I validate form input?"}'
```

Valid prefixes: `@code`, `@data`, `@writing`, `@career`

---

## Confidence Threshold

By default, if the classifier confidence is below 0.7, the intent is changed to `unclear`.

Configure via environment variable:

```bash
CONFIDENCE_THRESHOLD=0.6
```

---

## Rate Limiting & Retries

The API automatically retries failed requests with exponential backoff:

- Initial retry after 15 seconds
- Subsequent retries after 30, 45 seconds
- Max 3 attempts

---

## Example cURL Requests

### Basic Message Routing

```bash
curl -X POST http://localhost:3000/api/route \
  -H "Content-Type: application/json" \
  -d '{"message": "What is machine learning?"}'
```

### With Manual Override

```bash
curl -X POST http://localhost:3000/api/route \
  -H "Content-Type: application/json" \
  -d '{"message": "@data What is the average of 10, 20, 30?"}'
```

### Check Server Health

```bash
curl http://localhost:3000/api/health
```

### Get Recent Logs

```bash
curl "http://localhost:3000/api/logs?limit=20"
```

---

## Response Time

Most requests complete in 1-3 seconds. First requests may take longer due to model loading.

---

## Error Handling

All errors follow this format:

```json
{
  "error": "Error description",
  "statusCode": 400
}
```

Common errors:

- `400` - Invalid or missing message
- `429` - Rate limited (automatic retry occurs)
- `500` - Server error
- `502` - External API error (Groq unavailable)

---

## SDK/Library Integration

### JavaScript/TypeScript

```typescript
import { handleMessage } from "./src/index";

const result = await handleMessage("Your message here");
console.log(result.intent, result.confidence);
```

---

## Best Practices

1. **Message Length**: Keep messages under 8192 characters
2. **Timeouts**: Set client timeout to at least 30 seconds
3. **Rate Limiting**: Space requests at least 1 second apart
4. **Error Handling**: Implement retry logic with exponential backoff
5. **Logging**: Check `/api/logs` endpoint for debugging

---

## Support

For issues or questions:

- Check [CONTRIBUTING.md](./CONTRIBUTING.md)
- Review [README.md](./README.md)
- Open an issue on GitHub
