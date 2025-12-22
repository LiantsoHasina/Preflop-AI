import { Request, Response } from 'express';
import { ClaudeAIService } from '../services/claudeAI.service';
import { HandAnalysisRequest } from '../types/poker.types';

export class PokerController {
  private claudeService: ClaudeAIService;

  constructor() {
    this.claudeService = new ClaudeAIService();
  }

  /**
   * POST /api/poker/analyze
   * Analyzes a poker hand using Claude AI
   */
  analyzeHand = async (req: Request, res: Response): Promise<void> => {
    try {
      const { hand, position }: HandAnalysisRequest = req.body;

      // Validate request
      if (!hand || !Array.isArray(hand) || hand.length !== 2) {
        res.status(400).json({
          error: 'Invalid request: hand must be an array of 2 cards'
        });
        return;
      }

      if (!position) {
        res.status(400).json({
          error: 'Invalid request: position is required'
        });
        return;
      }

      // Analyze hand with Claude
      const analysis = await this.claudeService.analyzeHand({ hand, position });

      res.status(200).json(analysis);
    } catch (error) {
      console.error('Error in analyzeHand controller:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * GET /api/poker/health
   * Health check endpoint
   */
  healthCheck = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({
      status: 'ok',
      service: 'Poker Preflop Trainer API',
      timestamp: new Date().toISOString()
    });
  };
}
