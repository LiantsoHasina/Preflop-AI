# Preflop_back

Express.js backend API with TypeScript and MongoDB.

## Tech Stack

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose

## Setup

1. Install dependencies:
```bash
yarn install
```

2. Configure environment variables:
```bash
cp .env.example .env
```
Edit `.env` with your MongoDB connection string and other settings.

3. Start development server:
```bash
yarn dev
```

## Available Scripts

- `yarn dev` - Start development server with hot reload
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn start:prod` - Build and start production server

## Project Structure

```
src/
  ├── config/       # Configuration files (database, etc.)
  ├── controllers/  # Route controllers
  ├── middlewares/  # Custom middlewares
  ├── models/       # Mongoose models
  ├── routes/       # API routes
  ├── app.ts        # Express app setup
  └── server.ts     # Server entry point
```

## API Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check endpoint
