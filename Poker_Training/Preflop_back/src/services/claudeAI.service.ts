import Anthropic from '@anthropic-ai/sdk';
import { HandAnalysisRequest, HandAnalysisResponse, Action } from '../types/poker.types';

export class ClaudeAIService {
  private client: Anthropic;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
    }

    this.client = new Anthropic({
      apiKey: apiKey,
    });
  }

  /**
   * Analyzes a poker hand using Claude AI
   */
  async analyzeHand(request: HandAnalysisRequest): Promise<HandAnalysisResponse> {
    const prompt = this.buildPrompt(request);

    try {
      const message = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      // Extract text content from the response
      const textContent = message.content.find(block => block.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text response from Claude');
      }

      const responseText = textContent.text;

      // Parse the JSON response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not parse JSON from Claude response');
      }

      const analysis: HandAnalysisResponse = JSON.parse(jsonMatch[0]);

      // Validate the response
      if (!this.isValidAction(analysis.action)) {
        throw new Error(`Invalid action received: ${analysis.action}`);
      }

      return analysis;
    } catch (error) {
      console.error('Error analyzing hand with Claude:', error);
      throw error;
    }
  }

  /**
   * Builds the prompt for Claude AI
   */
  private buildPrompt(request: HandAnalysisRequest): string {
    const { hand, position } = request;
    const handNotation = this.getHandNotation(hand);

    return `You are an expert poker coach specializing in preflop Texas Hold'em strategy. Analyze the following hand and provide a GTO (Game Theory Optimal) recommendation.

Hand: ${handNotation}
Position: ${position}

Analyze this hand and provide your response in the following JSON format:
{
  "action": "raise" | "call" | "fold",
  "explanation": "2-3 sentences explaining why this action is optimal from ${position}",
  "confidence": 0-100,
  "reasoning": "Brief tactical analysis of equity, playability, and position"
}

Consider:
- Hand strength and equity against typical ranges
- Position advantage/disadvantage
- Playability postflop
- Standard GTO preflop ranges for ${position}
- Whether the hand is suited/offsuit, paired, or connected

Be specific about why this action is correct from ${position}. Reference poker concepts like equity, implied odds, reverse implied odds, and range advantage when relevant.

Respond ONLY with the JSON object, no additional text.`;
  }

  /**
   * Converts hand array to poker notation
   */
  private getHandNotation(hand: Card[]): string {
    if (!hand || hand.length !== 2) return 'Invalid';

    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
    const rank1 = hand[0].rank;
    const rank2 = hand[1].rank;
    const suit1 = hand[0].suit;
    const suit2 = hand[1].suit;

    const rankValue = (r: string): number => ranks.indexOf(r);
    const higherRank = rankValue(rank1) > rankValue(rank2) ? rank1 : rank2;
    const lowerRank = rankValue(rank1) > rankValue(rank2) ? rank2 : rank1;

    if (rank1 === rank2) return rank1 + rank2;
    if (suit1 === suit2) return higherRank + lowerRank + 's';
    return higherRank + lowerRank + 'o';
  }

  /**
   * Validates if the action is valid
   */
  private isValidAction(action: string): action is Action {
    return ['raise', 'call', 'fold'].includes(action);
  }
}
