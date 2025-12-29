import { Request, Response } from 'express';
// AI SERVICE TEMPORARILY DISABLED
// import { ClaudeAIService } from '../services/claudeAI.service';
// import { HandAnalysisRequest } from '../types/poker.types';

export class PokerController {
  // AI SERVICE TEMPORARILY DISABLED
  // private claudeService: ClaudeAIService;
  // constructor() {
  //   this.claudeService = new ClaudeAIService();
  // }

  /**
   * POST /api/poker/analyze
   * AI analysis temporarily disabled
   */
  analyzeHand = async (req: Request, res: Response): Promise<void> => {
    // AI SERVICE TEMPORARILY DISABLED - Return error message
    res.status(503).json({
      error: 'AI analysis is temporarily disabled',
      message: 'We are searching for a better AI solution. Please use static ranges mode.'
    });

    /* ORIGINAL AI IMPLEMENTATION - Uncomment when ready
    try {
      const { hand, position }: HandAnalysisRequest = req.body;

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

      const analysis = await this.claudeService.analyzeHand({ hand, position });
      res.status(200).json(analysis);
    } catch (error) {
      console.error('Error in analyzeHand controller:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    */
  };

  /**
   * GET /api/poker/health
   * Health check endpoint
   */
  healthCheck = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({
      status: 'ok',
      service: 'Poker Preflop Trainer API',
      aiEnabled: false, // AI temporarily disabled
      timestamp: new Date().toISOString()
    });
  };
}
