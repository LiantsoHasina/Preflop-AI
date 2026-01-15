// Basic Poker Types
export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';
export type BettingRound = 'preflop' | 'flop' | 'turn' | 'river';
export type MultiplayerAction = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all-in';
export type PlayerStatus = 'active' | 'folded' | 'all-in' | 'waiting' | 'out';
export type RoomStatus = 'waiting' | 'playing' | 'finished';
export type HandRank = 'high-card' | 'pair' | 'two-pair' | 'three-of-a-kind' | 'straight' | 'flush' | 'full-house' | 'four-of-a-kind' | 'straight-flush' | 'royal-flush';

export interface Card {
  rank: Rank;
  suit: Suit;
}

// Room/Table settings
export interface MultiplayerRoomSettings {
  maxPlayers: number;
  buyIn: number;
  smallBlind: number;
  bigBlind: number;
  timerEnabled: boolean;
  timerSeconds: number;
  isPrivate: boolean;
}

// Online player info
export interface OnlinePlayer {
  socketId: string;
  name: string;
  email: string;
  seatIndex: number | null;
  chips: number;
  isReady: boolean;
  isHost: boolean;
  lastSeen: number;
}

// Room/Table info
export interface MultiplayerRoom {
  roomCode: string;
  hostId: string;
  settings: MultiplayerRoomSettings;
  players: OnlinePlayer[];
  status: RoomStatus;
  createdAt: number;
  currentHandNumber: number;
}

// Poker player in game
export interface PokerPlayer {
  id: number;
  socketId: string;
  name: string;
  chips: number;
  holeCards: Card[];
  currentBet: number;
  totalBetThisRound: number;
  status: PlayerStatus;
  isHuman: boolean;
  isDealer: boolean;
  position: number;
  hasActed: boolean;
}

// Evaluated hand result
export interface EvaluatedHand {
  rank: HandRank;
  rankValue: number;
  description: string;
  bestFiveCards: Card[];
  kickers: number[];
}

// Winner info
export interface WinnerInfo {
  socketId: string;
  playerId: number;
  playerName: string;
  amount: number;
  hand: EvaluatedHand;
  holeCards: Card[];
}

// Side pot
export interface SidePot {
  amount: number;
  eligiblePlayerIds: number[];
}

// Game settings
export interface PokerGameSettings {
  playerCount: number;
  buyIn: number;
  smallBlind: number;
  bigBlind: number;
  playerName: string;
}

// Full multiplayer game state
export interface PokerGameState {
  roomCode: string;
  settings: PokerGameSettings;
  players: PokerPlayer[];
  dealerPosition: number;
  smallBlindPosition: number;
  bigBlindPosition: number;
  bettingRound: BettingRound;
  currentPlayerIndex: number;
  currentBet: number;
  minRaise: number;
  communityCards: Card[];
  deck: Card[];
  pot: number;
  sidePots: SidePot[];
  isHandComplete: boolean;
  isGameOver: boolean;
  winners: WinnerInfo[];
  showdown: boolean;
  waitingForHumanAction: boolean;
}

// Socket events (client -> server)
export interface ClientToServerEvents {
  'room:create': (settings: MultiplayerRoomSettings) => void;
  'room:join': (roomCode: string) => void;
  'room:leave': () => void;
  'room:start': () => void;
  'room:kick': (socketId: string) => void;
  'player:ready': (isReady: boolean) => void;
  'player:seat': (seatIndex: number) => void;
  'game:action': (action: MultiplayerAction, amount?: number) => void;
}

// Socket events (server -> client)
export interface ServerToClientEvents {
  'room:created': (room: MultiplayerRoom) => void;
  'room:joined': (room: MultiplayerRoom) => void;
  'room:updated': (room: MultiplayerRoom) => void;
  'room:left': () => void;
  'room:error': (message: string) => void;
  'room:list': (rooms: MultiplayerRoom[]) => void;
  'game:started': (gameState: PokerGameState) => void;
  'game:updated': (gameState: PokerGameState) => void;
  'game:ended': (winners: WinnerInfo[]) => void;
  'timer:tick': (secondsLeft: number) => void;
  'timer:expired': (socketId: string) => void;
  'player:joined': (player: OnlinePlayer) => void;
  'player:left': (socketId: string) => void;
  'player:disconnected': (socketId: string) => void;
  'player:reconnected': (socketId: string) => void;
}

// Internal socket data
export interface SocketData {
  odtId: string;  // Keep as odtId internally for socket.id reference
  name: string;
  email: string;
  roomCode?: string;
}
