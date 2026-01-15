import { io, Socket } from 'socket.io-client';
import type {
  MultiplayerRoom,
  MultiplayerRoomSettings,
  PokerGameState,
  WinnerInfo,
  OnlinePlayer,
  MultiplayerAction,
  ClientToServerEvents,
  ServerToClientEvents
} from '../types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

class SocketService {
  private socket: TypedSocket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      }) as TypedSocket;

      this.socket.on('connect', () => {
        console.log('Connected to multiplayer server');
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from server:', reason);
        this.emit('disconnected', reason);
      });

      // Set up event forwarding
      this.setupEventForwarding();
    });
  }

  private setupEventForwarding() {
    if (!this.socket) return;

    // Room events
    this.socket.on('room:created', (room) => this.emit('room:created', room));
    this.socket.on('room:joined', (room) => this.emit('room:joined', room));
    this.socket.on('room:updated', (room) => this.emit('room:updated', room));
    this.socket.on('room:left', () => this.emit('room:left'));
    this.socket.on('room:error', (message) => this.emit('room:error', message));
    this.socket.on('room:list', (rooms) => this.emit('room:list', rooms));

    // Game events
    this.socket.on('game:started', (state) => this.emit('game:started', state));
    this.socket.on('game:updated', (state) => this.emit('game:updated', state));
    this.socket.on('game:ended', (winners) => this.emit('game:ended', winners));

    // Timer events
    this.socket.on('timer:tick', (seconds) => this.emit('timer:tick', seconds));
    this.socket.on('timer:expired', (socketId) => this.emit('timer:expired', socketId));

    // Player events
    this.socket.on('player:joined', (player) => this.emit('player:joined', player));
    this.socket.on('player:left', (socketId) => this.emit('player:left', socketId));
    this.socket.on('player:disconnected', (socketId) => this.emit('player:disconnected', socketId));
    this.socket.on('player:reconnected', (socketId) => this.emit('player:reconnected', socketId));
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  // Room actions
  createRoom(settings: MultiplayerRoomSettings) {
    this.socket?.emit('room:create', settings);
  }

  joinRoom(roomCode: string) {
    this.socket?.emit('room:join', roomCode);
  }

  leaveRoom() {
    this.socket?.emit('room:leave');
  }

  startGame() {
    this.socket?.emit('room:start');
  }

  kickPlayer(odtId: string) {
    this.socket?.emit('room:kick', odtId);
  }

  // Player actions
  setReady(isReady: boolean) {
    this.socket?.emit('player:ready', isReady);
  }

  selectSeat(seatIndex: number) {
    this.socket?.emit('player:seat', seatIndex);
  }

  // Game actions
  sendAction(action: MultiplayerAction, amount?: number) {
    this.socket?.emit('game:action', action, amount);
  }

  // Event subscription
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, ...args: unknown[]) {
    this.listeners.get(event)?.forEach((callback) => callback(...args));
  }
}

export const socketService = new SocketService();

// Export types for convenience
export type {
  MultiplayerRoom,
  MultiplayerRoomSettings,
  PokerGameState,
  WinnerInfo,
  OnlinePlayer
};
