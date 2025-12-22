# Poker Preflop Trainer - Backend API

Backend API for the Poker Preflop Trainer with Claude AI integration.

## Setup

### 1. Install Dependencies

```bash
cd Preflop_back
yarn install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:

```env
ANTHROPIC_API_KEY=your_actual_api_key_here
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Get Anthropic API Key

1. Go to [https://console.anthropic.com/](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy and paste it into your `.env` file

## Running the Server

### Development Mode

```bash
yarn dev
```

Server will run on `http://localhost:3001`

### Production Build

```bash
yarn build
yarn start
```

## API Endpoints

### Health Check
```
GET /api/poker/health
```

### Analyze Hand
```
POST /api/poker/analyze

Body:
{
  "hand": [
    { "rank": "A", "suit": "♠" },
    { "rank": "K", "suit": "♥" }
  ],
  "position": "BTN"
}

Response:
{
  "action": "raise",
  "explanation": "Detailed explanation...",
  "confidence": 95,
  "reasoning": "Tactical analysis..."
}
```

## Tech Stack

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Anthropic Claude API** - AI analysis
- **CORS** - Cross-origin support

## Project Structure

```
Preflop_back/
├── src/
│   ├── controllers/    # Request handlers
│   ├── services/       # Business logic (Claude AI)
│   ├── routes/         # API routes
│   ├── types/          # TypeScript types
│   └── server.ts       # Entry point
├── dist/               # Compiled JavaScript
├── package.json
└── tsconfig.json
```

## Notes

- The API uses Claude 3.5 Sonnet for optimal poker strategy analysis
- Requests are not cached by default (implement caching if needed)
- Average response time: 1-2 seconds
- Cost: ~$0.01-0.03 per request
