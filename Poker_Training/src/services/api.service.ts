import type { Card, Position, Action } from '../types';

interface AIAnalysisResponse {
  action: Action;
  explanation: string;
  confidence: number;
  reasoning: string;
}

export class PokerAPIService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  }

  /**
   * Analyze hand - currently uses static ranges (AI available in backend)
   */
  async analyzeHand(_hand: Card[], _position: Position): Promise<AIAnalysisResponse> {
    throw new Error('AI analysis not enabled. Using static ranges.');
  }

  /**
   * Health check for the API
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/poker/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const pokerAPI = new PokerAPIService();
