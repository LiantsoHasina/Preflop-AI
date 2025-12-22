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
   * Analyzes a poker hand using Claude AI backend
   */
  async analyzeHand(hand: Card[], position: Position): Promise<AIAnalysisResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/poker/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hand, position })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing hand with AI:', error);
      throw error;
    }
  }

  /**
   * Health check for the API
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/poker/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const pokerAPI = new PokerAPIService();
