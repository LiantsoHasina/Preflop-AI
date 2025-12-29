import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import {
  PreflopProgression,
  PostflopProgression,
  FullGameProgression,
  PlayPokerProgression
} from '../models/Progression.model';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

type GameMode = 'preflop-only' | 'postflop-only' | 'full-game' | 'play-poker';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getModelForMode = (mode: GameMode): any => {
  switch (mode) {
    case 'preflop-only':
      return PreflopProgression;
    case 'postflop-only':
      return PostflopProgression;
    case 'full-game':
      return FullGameProgression;
    case 'play-poker':
      return PlayPokerProgression;
    default:
      return null;
  }
};

// Get progression for a specific mode
router.get('/:mode', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const mode = req.params.mode as GameMode;
    const Model = getModelForMode(mode);

    if (!Model) {
      res.status(400).json({ error: 'Invalid game mode' });
      return;
    }

    let progression = await Model.findOne({ userId: req.userId });

    // If no progression exists, create a new one
    if (!progression) {
      progression = new Model({ userId: req.userId });
      await progression.save();
    }

    res.json({ progression });
  } catch (error) {
    console.error('Get progression error:', error);
    res.status(500).json({ error: 'Failed to get progression' });
  }
});

// Get all progressions
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [preflop, postflop, fullGame, playPoker] = await Promise.all([
      PreflopProgression.findOne({ userId: req.userId }),
      PostflopProgression.findOne({ userId: req.userId }),
      FullGameProgression.findOne({ userId: req.userId }),
      PlayPokerProgression.findOne({ userId: req.userId })
    ]);

    res.json({
      progressions: {
        'preflop-only': preflop,
        'postflop-only': postflop,
        'full-game': fullGame,
        'play-poker': playPoker
      }
    });
  } catch (error) {
    console.error('Get all progressions error:', error);
    res.status(500).json({ error: 'Failed to get progressions' });
  }
});

// Update preflop-only progression
router.post('/preflop-only', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { position, isCorrect, currentStreak } = req.body;

    const update: Record<string, unknown> = {
      $inc: {
        totalHands: 1,
        correctAnswers: isCorrect ? 1 : 0,
        [`positionStats.${position}.total`]: 1,
        [`positionStats.${position}.correct`]: isCorrect ? 1 : 0
      },
      $set: { lastUpdated: new Date() }
    };

    // Update best streak if current is higher
    const progression = await PreflopProgression.findOneAndUpdate(
      { userId: req.userId },
      update,
      { upsert: true, new: true }
    );

    if (currentStreak > progression.bestStreak) {
      progression.bestStreak = currentStreak;
      await progression.save();
    }

    res.json({ progression });
  } catch (error) {
    console.error('Update preflop progression error:', error);
    res.status(500).json({ error: 'Failed to update progression' });
  }
});

// Update postflop-only progression
router.post('/postflop-only', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { street, decisionType, isCorrect, currentStreak } = req.body;

    const update: Record<string, unknown> = {
      $inc: {
        totalHands: 1,
        correctAnswers: isCorrect ? 1 : 0,
        [`streetStats.${street}.total`]: 1,
        [`streetStats.${street}.correct`]: isCorrect ? 1 : 0,
        [`decisionTypeStats.${decisionType}.total`]: 1,
        [`decisionTypeStats.${decisionType}.correct`]: isCorrect ? 1 : 0
      },
      $set: { lastUpdated: new Date() }
    };

    const progression = await PostflopProgression.findOneAndUpdate(
      { userId: req.userId },
      update,
      { upsert: true, new: true }
    );

    if (currentStreak > progression.bestStreak) {
      progression.bestStreak = currentStreak;
      await progression.save();
    }

    res.json({ progression });
  } catch (error) {
    console.error('Update postflop progression error:', error);
    res.status(500).json({ error: 'Failed to update progression' });
  }
});

// Update full-game progression
router.post('/full-game', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { phase, position, street, isCorrect, currentStreak } = req.body;

    const incFields: Record<string, number> = {
      totalHands: 1
    };

    if (phase === 'preflop') {
      incFields.preflopTotal = 1;
      incFields.preflopCorrect = isCorrect ? 1 : 0;
      if (position) {
        incFields[`positionStats.${position}.total`] = 1;
        incFields[`positionStats.${position}.correct`] = isCorrect ? 1 : 0;
      }
    } else {
      incFields.postflopTotal = 1;
      incFields.postflopCorrect = isCorrect ? 1 : 0;
      if (street) {
        incFields[`streetStats.${street}.total`] = 1;
        incFields[`streetStats.${street}.correct`] = isCorrect ? 1 : 0;
      }
    }

    const update: Record<string, unknown> = {
      $inc: incFields,
      $set: { lastUpdated: new Date() }
    };

    const progression = await FullGameProgression.findOneAndUpdate(
      { userId: req.userId },
      update,
      { upsert: true, new: true }
    );

    if (currentStreak > progression.bestStreak) {
      progression.bestStreak = currentStreak;
      await progression.save();
    }

    res.json({ progression });
  } catch (error) {
    console.error('Update full-game progression error:', error);
    res.status(500).json({ error: 'Failed to update progression' });
  }
});

// Update play-poker progression
router.post('/play-poker', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      handComplete,
      gameComplete,
      winnings,
      potSize,
      reachedShowdown,
      wonShowdown,
      preflopDecisionCorrect,
      postflopDecisionCorrect,
      wasBluff,
      bluffOptimal,
      wasValueBet,
      valueBetOptimal
    } = req.body;

    const incFields: Record<string, number> = {};

    if (handComplete) {
      incFields.handsPlayed = 1;
    }

    if (gameComplete) {
      incFields.gamesPlayed = 1;
    }

    if (winnings !== undefined) {
      incFields.totalWinnings = winnings;
    }

    if (reachedShowdown) {
      incFields.showdownsReached = 1;
      if (wonShowdown) {
        incFields.showdownWins = 1;
      }
    }

    if (preflopDecisionCorrect !== undefined) {
      incFields.totalPreflopDecisions = 1;
      if (preflopDecisionCorrect) {
        incFields.correctPreflopDecisions = 1;
      }
    }

    if (postflopDecisionCorrect !== undefined) {
      incFields.totalPostflopDecisions = 1;
      if (postflopDecisionCorrect) {
        incFields.correctPostflopDecisions = 1;
      }
    }

    if (wasBluff) {
      incFields.totalBluffAttempts = 1;
      if (bluffOptimal) {
        incFields.optimalBluffs = 1;
      }
    }

    if (wasValueBet) {
      incFields.totalValueBetAttempts = 1;
      if (valueBetOptimal) {
        incFields.optimalValueBets = 1;
      }
    }

    const update: Record<string, unknown> = {
      $inc: incFields,
      $set: { lastUpdated: new Date() }
    };

    const progression = await PlayPokerProgression.findOneAndUpdate(
      { userId: req.userId },
      update,
      { upsert: true, new: true }
    );

    // Update biggest pot if current is larger
    if (potSize && potSize > progression.biggestPot) {
      progression.biggestPot = potSize;
      await progression.save();
    }

    res.json({ progression });
  } catch (error) {
    console.error('Update play-poker progression error:', error);
    res.status(500).json({ error: 'Failed to update progression' });
  }
});

// Reset progression for a mode
router.delete('/:mode', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const mode = req.params.mode as GameMode;
    const Model = getModelForMode(mode);

    if (!Model) {
      res.status(400).json({ error: 'Invalid game mode' });
      return;
    }

    await Model.findOneAndDelete({ userId: req.userId });

    res.json({ message: 'Progression reset successfully' });
  } catch (error) {
    console.error('Reset progression error:', error);
    res.status(500).json({ error: 'Failed to reset progression' });
  }
});

export default router;
