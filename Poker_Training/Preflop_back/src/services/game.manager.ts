import {
  Card,
  Suit,
  Rank,
  PokerGameState,
  PokerPlayer,
  OnlinePlayer,
  MultiplayerRoomSettings,
  MultiplayerAction,
  BettingRound,
  EvaluatedHand,
  WinnerInfo,
  SidePot
} from '../types/multiplayer.types';

const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

export class GameManager {
  private roomCode: string;
  private state: PokerGameState;
  private settings: MultiplayerRoomSettings;
  private onStateUpdate: (state: PokerGameState) => void;
  private onTimerExpired: (socketId: string) => void;
  private onTimerTick: (seconds: number) => void;
  private timer: NodeJS.Timeout | null = null;
  private timerSecondsLeft: number = 0;

  constructor(
    roomCode: string,
    players: OnlinePlayer[],
    settings: MultiplayerRoomSettings,
    onStateUpdate: (state: PokerGameState) => void,
    onTimerExpired: (socketId: string) => void,
    onTimerTick: (seconds: number) => void
  ) {
    this.roomCode = roomCode;
    this.settings = settings;
    this.onStateUpdate = onStateUpdate;
    this.onTimerExpired = onTimerExpired;
    this.onTimerTick = onTimerTick;

    // Initialize game state
    this.state = this.createInitialState(players, settings);
  }

  private createInitialState(players: OnlinePlayer[], settings: MultiplayerRoomSettings): PokerGameState {
    // Sort players by seat index
    const sortedPlayers = [...players].sort((a, b) => (a.seatIndex || 0) - (b.seatIndex || 0));

    const pokerPlayers: PokerPlayer[] = sortedPlayers.map((p, index) => ({
      id: index,
      socketId: p.socketId,
      name: p.name,
      chips: p.chips,
      holeCards: [],
      currentBet: 0,
      totalBetThisRound: 0,
      status: 'active',
      isHuman: true, // All players in multiplayer are human
      isDealer: index === 0,
      position: index,
      hasActed: false
    }));

    return {
      roomCode: this.roomCode,
      settings: {
        playerCount: players.length,
        buyIn: settings.buyIn,
        smallBlind: settings.smallBlind,
        bigBlind: settings.bigBlind,
        playerName: ''
      },
      players: pokerPlayers,
      dealerPosition: 0,
      smallBlindPosition: players.length > 2 ? 1 : 0,
      bigBlindPosition: players.length > 2 ? 2 : 1,
      bettingRound: 'preflop',
      currentPlayerIndex: 0,
      currentBet: 0,
      minRaise: settings.bigBlind,
      communityCards: [],
      deck: [],
      pot: 0,
      sidePots: [],
      isHandComplete: false,
      isGameOver: false,
      winners: [],
      showdown: false,
      waitingForHumanAction: false
    };
  }

  startGame(): PokerGameState {
    return this.startNewHand();
  }

  private startNewHand(): PokerGameState {
    // Create and shuffle deck
    this.state.deck = this.createDeck();
    this.shuffleDeck();

    // Reset player states
    this.state.players.forEach(p => {
      p.holeCards = [];
      p.currentBet = 0;
      p.totalBetThisRound = 0;
      p.hasActed = false;
      if (p.chips > 0 && p.status !== 'out') {
        p.status = 'active';
      }
    });

    // Reset game state
    this.state.communityCards = [];
    this.state.pot = 0;
    this.state.sidePots = [];
    this.state.isHandComplete = false;
    this.state.winners = [];
    this.state.showdown = false;
    this.state.bettingRound = 'preflop';
    this.state.currentBet = this.settings.bigBlind;
    this.state.minRaise = this.settings.bigBlind;

    // Deal hole cards
    const activePlayers = this.state.players.filter(p => p.status !== 'out');
    activePlayers.forEach(player => {
      player.holeCards = [this.state.deck.pop()!, this.state.deck.pop()!];
    });

    // Post blinds
    const sbPlayer = this.state.players[this.state.smallBlindPosition];
    const bbPlayer = this.state.players[this.state.bigBlindPosition];

    const sbAmount = Math.min(this.settings.smallBlind, sbPlayer.chips);
    const bbAmount = Math.min(this.settings.bigBlind, bbPlayer.chips);

    sbPlayer.currentBet = sbAmount;
    sbPlayer.totalBetThisRound = sbAmount;
    sbPlayer.chips -= sbAmount;

    bbPlayer.currentBet = bbAmount;
    bbPlayer.totalBetThisRound = bbAmount;
    bbPlayer.chips -= bbAmount;

    this.state.pot = sbAmount + bbAmount;

    // Set first to act (UTG in preflop, SB postflop)
    this.state.currentPlayerIndex = this.getNextActivePlayer(this.state.bigBlindPosition);

    // Start timer if enabled
    this.startTimer();

    return this.state;
  }

  private createDeck(): Card[] {
    const deck: Card[] = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push({ suit, rank });
      }
    }
    return deck;
  }

  private shuffleDeck(): void {
    for (let i = this.state.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.state.deck[i], this.state.deck[j]] = [this.state.deck[j], this.state.deck[i]];
    }
  }

  private getNextActivePlayer(fromIndex: number): number {
    let nextIndex = (fromIndex + 1) % this.state.players.length;
    let attempts = 0;

    while (attempts < this.state.players.length) {
      const player = this.state.players[nextIndex];
      if (player.status === 'active') {
        return nextIndex;
      }
      nextIndex = (nextIndex + 1) % this.state.players.length;
      attempts++;
    }

    return fromIndex;
  }

  private getActivePlayers(): PokerPlayer[] {
    return this.state.players.filter(p => p.status === 'active' || p.status === 'all-in');
  }

  private getPlayersCanAct(): PokerPlayer[] {
    return this.state.players.filter(p => p.status === 'active');
  }

  processAction(
    socketId: string,
    action: MultiplayerAction,
    amount?: number
  ): { state?: PokerGameState; error?: string } {
    const currentPlayer = this.state.players[this.state.currentPlayerIndex];

    // Verify it's the player's turn
    if (currentPlayer.socketId !== socketId) {
      return { error: 'Not your turn' };
    }

    // Verify player is active
    if (currentPlayer.status !== 'active') {
      return { error: 'Cannot act' };
    }

    // Stop timer
    this.stopTimer();

    // Process the action
    switch (action) {
      case 'fold':
        currentPlayer.status = 'folded';
        break;

      case 'check':
        if (this.state.currentBet > currentPlayer.currentBet) {
          return { error: 'Cannot check, must call or raise' };
        }
        break;

      case 'call':
        const toCall = this.state.currentBet - currentPlayer.currentBet;
        const callAmount = Math.min(toCall, currentPlayer.chips);
        currentPlayer.chips -= callAmount;
        currentPlayer.currentBet += callAmount;
        currentPlayer.totalBetThisRound += callAmount;
        this.state.pot += callAmount;

        if (currentPlayer.chips === 0) {
          currentPlayer.status = 'all-in';
        }
        break;

      case 'bet':
      case 'raise':
        const raiseAmount = amount || this.state.minRaise;
        const totalBet = Math.min(raiseAmount, currentPlayer.chips + currentPlayer.currentBet);
        const additional = totalBet - currentPlayer.currentBet;

        if (additional > currentPlayer.chips) {
          return { error: 'Not enough chips' };
        }

        // Update min raise
        const raiseSize = totalBet - this.state.currentBet;
        if (raiseSize > 0) {
          this.state.minRaise = totalBet + raiseSize;
        }

        currentPlayer.chips -= additional;
        currentPlayer.currentBet = totalBet;
        currentPlayer.totalBetThisRound += additional;
        this.state.currentBet = totalBet;
        this.state.pot += additional;

        if (currentPlayer.chips === 0) {
          currentPlayer.status = 'all-in';
        }

        // Reset hasActed for other players
        this.state.players.forEach(p => {
          if (p.id !== currentPlayer.id && p.status === 'active') {
            p.hasActed = false;
          }
        });
        break;

      case 'all-in':
        const allInAmount = currentPlayer.chips;
        const totalAllIn = currentPlayer.currentBet + allInAmount;

        if (totalAllIn > this.state.currentBet) {
          const raiseBy = totalAllIn - this.state.currentBet;
          this.state.minRaise = totalAllIn + raiseBy;
          this.state.currentBet = totalAllIn;

          // Reset hasActed for other players
          this.state.players.forEach(p => {
            if (p.id !== currentPlayer.id && p.status === 'active') {
              p.hasActed = false;
            }
          });
        }

        this.state.pot += allInAmount;
        currentPlayer.currentBet = totalAllIn;
        currentPlayer.totalBetThisRound += allInAmount;
        currentPlayer.chips = 0;
        currentPlayer.status = 'all-in';
        break;
    }

    currentPlayer.hasActed = true;

    // Check if hand is over or betting round complete
    if (this.isHandOver()) {
      this.resolveHand();
    } else if (this.isBettingRoundComplete()) {
      this.advanceToNextRound();
    } else {
      this.state.currentPlayerIndex = this.getNextActivePlayer(this.state.currentPlayerIndex);
      this.startTimer();
    }

    return { state: this.state };
  }

  private isBettingRoundComplete(): boolean {
    const playersCanAct = this.getPlayersCanAct();

    // If only one player left, round is complete
    if (playersCanAct.length <= 1) {
      return true;
    }

    // All active players must have acted and matched the current bet
    return playersCanAct.every(p =>
      p.hasActed && (p.currentBet === this.state.currentBet || p.status === 'all-in')
    );
  }

  private isHandOver(): boolean {
    const activePlayers = this.getActivePlayers();

    // Only one player left (everyone else folded)
    if (activePlayers.length === 1) {
      return true;
    }

    // River betting complete
    if (this.state.bettingRound === 'river' && this.isBettingRoundComplete()) {
      return true;
    }

    // All players all-in
    const playersCanAct = this.getPlayersCanAct();
    if (playersCanAct.length === 0 || (playersCanAct.length === 1 && this.isBettingRoundComplete())) {
      return true;
    }

    return false;
  }

  private advanceToNextRound(): void {
    // Reset player bets and hasActed
    this.state.players.forEach(p => {
      p.currentBet = 0;
      p.hasActed = false;
    });

    this.state.currentBet = 0;
    this.state.minRaise = this.settings.bigBlind;

    // Deal community cards
    switch (this.state.bettingRound) {
      case 'preflop':
        this.state.bettingRound = 'flop';
        this.state.deck.pop(); // Burn
        this.state.communityCards.push(
          this.state.deck.pop()!,
          this.state.deck.pop()!,
          this.state.deck.pop()!
        );
        break;
      case 'flop':
        this.state.bettingRound = 'turn';
        this.state.deck.pop(); // Burn
        this.state.communityCards.push(this.state.deck.pop()!);
        break;
      case 'turn':
        this.state.bettingRound = 'river';
        this.state.deck.pop(); // Burn
        this.state.communityCards.push(this.state.deck.pop()!);
        break;
    }

    // Set first to act (first active player after dealer)
    this.state.currentPlayerIndex = this.getNextActivePlayer(this.state.dealerPosition);

    // Start timer
    this.startTimer();
  }

  private resolveHand(): void {
    this.state.isHandComplete = true;
    this.state.showdown = true;
    this.stopTimer();

    const activePlayers = this.getActivePlayers();

    // Single winner (everyone folded)
    if (activePlayers.length === 1) {
      const winner = activePlayers[0];
      winner.chips += this.state.pot;
      this.state.winners = [{
        socketId: winner.socketId,
        playerId: winner.id,
        playerName: winner.name,
        amount: this.state.pot,
        hand: { rank: 'high-card', rankValue: 0, description: 'Last player standing', bestFiveCards: [], kickers: [] },
        holeCards: winner.holeCards
      }];
    } else {
      // Showdown - evaluate hands
      const evaluatedPlayers = activePlayers.map(p => ({
        player: p,
        hand: this.evaluateHand(p.holeCards, this.state.communityCards)
      }));

      // Sort by hand strength
      evaluatedPlayers.sort((a, b) => {
        if (a.hand.rankValue !== b.hand.rankValue) {
          return b.hand.rankValue - a.hand.rankValue;
        }
        // Compare kickers
        for (let i = 0; i < a.hand.kickers.length; i++) {
          if (a.hand.kickers[i] !== b.hand.kickers[i]) {
            return b.hand.kickers[i] - a.hand.kickers[i];
          }
        }
        return 0;
      });

      // Find winners (may be multiple in case of tie)
      const winners: typeof evaluatedPlayers = [evaluatedPlayers[0]];
      for (let i = 1; i < evaluatedPlayers.length; i++) {
        const current = evaluatedPlayers[i];
        const best = evaluatedPlayers[0];
        if (current.hand.rankValue === best.hand.rankValue) {
          let isTie = true;
          for (let j = 0; j < current.hand.kickers.length; j++) {
            if (current.hand.kickers[j] !== best.hand.kickers[j]) {
              isTie = false;
              break;
            }
          }
          if (isTie) {
            winners.push(current);
          }
        }
      }

      // Split pot among winners
      const winAmount = Math.floor(this.state.pot / winners.length);
      this.state.winners = winners.map(w => {
        w.player.chips += winAmount;
        return {
          socketId: w.player.socketId,
          playerId: w.player.id,
          playerName: w.player.name,
          amount: winAmount,
          hand: w.hand,
          holeCards: w.player.holeCards
        };
      });
    }

    // Check if game is over (only one player with chips)
    const playersWithChips = this.state.players.filter(p => p.chips > 0);
    if (playersWithChips.length === 1) {
      this.state.isGameOver = true;
    }
  }

  private evaluateHand(holeCards: Card[], communityCards: Card[]): EvaluatedHand {
    const allCards = [...holeCards, ...communityCards];

    // Simple hand evaluation
    const rankCount: { [key: string]: number } = {};
    const suitCount: { [key: string]: number } = {};

    allCards.forEach(card => {
      rankCount[card.rank] = (rankCount[card.rank] || 0) + 1;
      suitCount[card.suit] = (suitCount[card.suit] || 0) + 1;
    });

    const rankValues = allCards.map(c => this.getRankValue(c.rank)).sort((a, b) => b - a);
    const isFlush = Object.values(suitCount).some(count => count >= 5);
    const isStraight = this.checkStraight(rankValues);

    // Check for hand types
    const pairs = Object.entries(rankCount).filter(([_, count]) => count === 2);
    const trips = Object.entries(rankCount).filter(([_, count]) => count === 3);
    const quads = Object.entries(rankCount).filter(([_, count]) => count === 4);

    let rank: EvaluatedHand['rank'] = 'high-card';
    let rankValue = 0;
    let description = '';

    if (isStraight && isFlush) {
      if (rankValues.includes(14) && rankValues.includes(13)) {
        rank = 'royal-flush';
        rankValue = 10;
        description = 'Royal Flush';
      } else {
        rank = 'straight-flush';
        rankValue = 9;
        description = 'Straight Flush';
      }
    } else if (quads.length > 0) {
      rank = 'four-of-a-kind';
      rankValue = 8;
      description = `Four of a Kind, ${quads[0][0]}s`;
    } else if (trips.length > 0 && pairs.length > 0) {
      rank = 'full-house';
      rankValue = 7;
      description = `Full House, ${trips[0][0]}s full of ${pairs[0][0]}s`;
    } else if (isFlush) {
      rank = 'flush';
      rankValue = 6;
      description = 'Flush';
    } else if (isStraight) {
      rank = 'straight';
      rankValue = 5;
      description = 'Straight';
    } else if (trips.length > 0) {
      rank = 'three-of-a-kind';
      rankValue = 4;
      description = `Three of a Kind, ${trips[0][0]}s`;
    } else if (pairs.length >= 2) {
      rank = 'two-pair';
      rankValue = 3;
      description = `Two Pair, ${pairs[0][0]}s and ${pairs[1][0]}s`;
    } else if (pairs.length === 1) {
      rank = 'pair';
      rankValue = 2;
      description = `Pair of ${pairs[0][0]}s`;
    } else {
      rank = 'high-card';
      rankValue = 1;
      description = `High Card ${this.getRankName(allCards[0].rank)}`;
    }

    return {
      rank,
      rankValue,
      description,
      bestFiveCards: allCards.slice(0, 5),
      kickers: rankValues.slice(0, 5)
    };
  }

  private getRankValue(rank: Rank): number {
    const values: { [key: string]: number } = {
      '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
      'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
    };
    return values[rank];
  }

  private getRankName(rank: Rank): string {
    const names: { [key: string]: string } = {
      'T': 'Ten', 'J': 'Jack', 'Q': 'Queen', 'K': 'King', 'A': 'Ace',
      '2': 'Two', '3': 'Three', '4': 'Four', '5': 'Five',
      '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Nine'
    };
    return names[rank];
  }

  private checkStraight(sortedValues: number[]): boolean {
    const unique = [...new Set(sortedValues)];
    if (unique.length < 5) return false;

    for (let i = 0; i <= unique.length - 5; i++) {
      if (unique[i] - unique[i + 4] === 4) {
        return true;
      }
    }

    // Check for A-5 straight (wheel)
    if (unique.includes(14) && unique.includes(5) && unique.includes(4) && unique.includes(3) && unique.includes(2)) {
      return true;
    }

    return false;
  }

  // Timer management
  private startTimer(): void {
    if (!this.settings.timerEnabled) return;

    this.stopTimer();
    this.timerSecondsLeft = this.settings.timerSeconds;

    this.timer = setInterval(() => {
      this.timerSecondsLeft--;
      this.onTimerTick(this.timerSecondsLeft);

      if (this.timerSecondsLeft <= 0) {
        this.handleTimerExpired();
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private handleTimerExpired(): void {
    this.stopTimer();

    const currentPlayer = this.state.players[this.state.currentPlayerIndex];
    this.onTimerExpired(currentPlayer.socketId);

    // Auto-fold the player
    this.processAction(currentPlayer.socketId, 'fold');
    this.onStateUpdate(this.state);
  }

  handlePlayerDisconnect(socketId: string): void {
    const player = this.state.players.find(p => p.socketId === socketId);
    if (!player) return;

    // If it's their turn, auto-fold
    const currentPlayer = this.state.players[this.state.currentPlayerIndex];
    if (currentPlayer.socketId === socketId) {
      this.processAction(socketId, 'fold');
      this.onStateUpdate(this.state);
    }

    // Mark player as out
    player.status = 'out';
  }

  cleanup(): void {
    this.stopTimer();
  }
}
