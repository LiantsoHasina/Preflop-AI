import { Router } from 'express';
import { PokerController } from '../controllers/poker.controller';

const router = Router();
const pokerController = new PokerController();

// Health check
router.get('/health', pokerController.healthCheck);

// Analyze hand
router.post('/analyze', pokerController.analyzeHand);

export default router;
