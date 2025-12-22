# AI Integration Setup Guide

This guide explains how to set up and use the Claude AI integration for poker hand analysis.

## Overview

The Poker Preflop Trainer now supports two modes:
1. **Static Ranges** - Uses predefined GTO ranges (fast, free)
2. **AI Mode (Claude)** - Uses Claude AI for dynamic analysis (smart, costs API credits)

## Setup Instructions

### Step 1: Backend Setup

1. Navigate to the backend folder:
```bash
cd Preflop_back
```

2. Install dependencies:
```bash
yarn install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Get your Anthropic API key:
   - Visit [https://console.anthropic.com/](https://console.anthropic.com/)
   - Sign up / Log in
   - Go to "API Keys"
   - Create a new key
   - Copy the key

5. Add your API key to `.env`:
```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
PORT=3001
FRONTEND_URL=http://localhost:5173
```

6. Start the backend server:
```bash
yarn dev
```

The server should start on `http://localhost:3001`

### Step 2: Frontend Setup

The frontend is already configured! Just make sure the `.env` file exists:

```env
VITE_API_URL=http://localhost:3001/api
```

### Step 3: Run Both Services

**Terminal 1 - Backend:**
```bash
cd Preflop_back
yarn dev
```

**Terminal 2 - Frontend:**
```bash
yarn dev
```

## Using AI Mode

1. Open the app at `http://localhost:5173`
2. Look for the toggle at the top:
   - ✅ **🤖 AI Mode (Claude)** - Uses Claude AI
   - ☐ **📊 Static Ranges** - Uses predefined ranges

3. Toggle it ON to enable AI mode
4. Play hands as normal
5. AI will provide dynamic, contextual explanations

## Features

### AI Mode Benefits
- ✅ Dynamic, context-aware explanations
- ✅ Adapts to different playing styles
- ✅ Explains WHY, not just WHAT
- ✅ Considers equity, implied odds, and advanced concepts
- ✅ More educational and detailed

### Static Mode Benefits
- ✅ Instant responses (no API delay)
- ✅ Free (no API costs)
- ✅ Reliable GTO ranges
- ✅ Works offline
- ✅ Consistent recommendations

## Costs

Claude API Pricing (as of Dec 2024):
- Model: Claude 3.5 Sonnet
- Input: ~$3 per million tokens
- Output: ~$15 per million tokens
- **Average cost per hand: $0.01-0.03**

For 100 hands: ~$1-3

## Troubleshooting

### Backend won't start
- Check if `.env` file exists
- Verify ANTHROPIC_API_KEY is set
- Make sure port 3001 is not in use

### Frontend can't connect to backend
- Ensure backend is running (`yarn dev` in Preflop_back)
- Check `.env` has correct VITE_API_URL
- Verify CORS is allowing your frontend URL

### AI requests failing
- Check API key is valid
- Verify you have credits on Anthropic account
- Check backend logs for errors
- Toggle off AI mode to use static ranges as fallback

### Slow AI responses
- Normal: AI takes 1-2 seconds per request
- If slower: Check internet connection
- Consider implementing caching (not included by default)

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Frontend  │  HTTP   │   Backend    │   API   │   Claude    │
│   (React)   │ ------> │  (Express)   │ ------> │     AI      │
│             │ <------ │              │ <------ │             │
└─────────────┘         └──────────────┘         └─────────────┘
   Port 5173              Port 3001               Anthropic API
```

## Next Steps

### Optional Enhancements

1. **Add Caching** - Cache common hands to reduce API calls
2. **Batch Requests** - Queue multiple requests
3. **Confidence Display** - Show AI confidence in UI
4. **Compare Mode** - Show both AI and static side-by-side
5. **Fine-tune Prompts** - Customize AI personality/style

### Cost Optimization

1. **Cache Results** - Store previous analyses
2. **Debounce Requests** - Wait before sending
3. **Use Static for Common Hands** - Reserve AI for edge cases
4. **Implement Rate Limiting** - Prevent excessive usage

## Support

For issues or questions:
- Check backend logs: `Preflop_back/` console output
- Check browser console: F12 > Console
- Review Anthropic API docs: [https://docs.anthropic.com/](https://docs.anthropic.com/)

Enjoy your AI-powered poker training! 🎰🤖
