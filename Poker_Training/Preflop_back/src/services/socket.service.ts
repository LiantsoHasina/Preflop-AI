import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import {
  MultiplayerRoom,
  MultiplayerRoomSettings,
  OnlinePlayer,
  PokerGameState,
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
  MultiplayerAction
} from '../types/multiplayer.types';
import { RoomManager } from './room.manager';
import { GameManager } from './game.manager';

export class SocketService {
  private io: Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;
  private roomManager: RoomManager;
  private gameManagers: Map<string, GameManager> = new Map();

  constructor(io: Server) {
    this.io = io;
    this.roomManager = new RoomManager();
    this.setupMiddleware();
    this.setupConnectionHandler();
  }

  private setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
          userId: string;
          email: string;
        };

        socket.data.odtId = socket.id;
        socket.data.email = decoded.email;
        socket.data.name = decoded.email.split('@')[0];

        next();
      } catch (err) {
        next(new Error('Invalid token'));
      }
    });
  }

  private setupConnectionHandler() {
    this.io.on('connection', (socket) => {
      console.log(`Player connected: ${socket.data.name} (${socket.id})`);

      // Send public room list on connect
      socket.emit('room:list', this.roomManager.getPublicRooms());

      // Room events
      socket.on('room:create', (settings) => this.handleCreateRoom(socket, settings));
      socket.on('room:join', (roomCode) => this.handleJoinRoom(socket, roomCode));
      socket.on('room:leave', () => this.handleLeaveRoom(socket));
      socket.on('room:start', () => this.handleStartGame(socket));
      socket.on('room:kick', (socketId) => this.handleKickPlayer(socket, socketId));

      // Player events
      socket.on('player:ready', (isReady) => this.handlePlayerReady(socket, isReady));
      socket.on('player:seat', (seatIndex) => this.handlePlayerSeat(socket, seatIndex));

      // Game events
      socket.on('game:action', (action, amount) => this.handleGameAction(socket, action, amount));

      // Disconnect
      socket.on('disconnect', () => this.handleDisconnect(socket));
    });
  }

  private handleCreateRoom(socket: Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>, settings: MultiplayerRoomSettings) {
    try {
      // Leave any existing room
      if (socket.data.roomCode) {
        this.handleLeaveRoom(socket);
      }

      const player: OnlinePlayer = {
        socketId: socket.id,
        name: socket.data.name!,
        email: socket.data.email!,
        seatIndex: 0,
        chips: settings.buyIn,
        isReady: true, // Host is always ready
        isHost: true,
        lastSeen: Date.now()
      };

      const room = this.roomManager.createRoom(settings, player);
      socket.data.roomCode = room.roomCode;
      socket.join(room.roomCode);

      socket.emit('room:created', room);

      // Broadcast updated public room list
      if (!settings.isPrivate) {
        this.io.emit('room:list', this.roomManager.getPublicRooms());
      }

      console.log(`Room created: ${room.roomCode} by ${socket.data.name}`);
    } catch (error: any) {
      socket.emit('room:error', error.message || 'Failed to create room');
    }
  }

  private handleJoinRoom(socket: Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>, roomCode: string) {
    try {
      // Leave any existing room
      if (socket.data.roomCode) {
        this.handleLeaveRoom(socket);
      }

      const room = this.roomManager.getRoom(roomCode);
      if (!room) {
        socket.emit('room:error', 'Room not found');
        return;
      }

      if (room.status !== 'waiting') {
        socket.emit('room:error', 'Game already in progress');
        return;
      }

      if (room.players.length >= room.settings.maxPlayers) {
        socket.emit('room:error', 'Room is full');
        return;
      }

      // Find next available seat
      const occupiedSeats = new Set(room.players.map(p => p.seatIndex));
      let seatIndex = 0;
      while (occupiedSeats.has(seatIndex) && seatIndex < room.settings.maxPlayers) {
        seatIndex++;
      }

      const player: OnlinePlayer = {
        socketId: socket.id,
        name: socket.data.name!,
        email: socket.data.email!,
        seatIndex,
        chips: room.settings.buyIn,
        isReady: false,
        isHost: false,
        lastSeen: Date.now()
      };

      const updatedRoom = this.roomManager.addPlayer(roomCode, player);
      socket.data.roomCode = roomCode;
      socket.join(roomCode);

      socket.emit('room:joined', updatedRoom);
      socket.to(roomCode).emit('room:updated', updatedRoom);
      socket.to(roomCode).emit('player:joined', player);

      // Update public room list
      if (!room.settings.isPrivate) {
        this.io.emit('room:list', this.roomManager.getPublicRooms());
      }

      console.log(`${socket.data.name} joined room ${roomCode}`);
    } catch (error: any) {
      socket.emit('room:error', error.message || 'Failed to join room');
    }
  }

  private handleLeaveRoom(socket: Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>) {
    const roomCode = socket.data.roomCode;
    if (!roomCode) return;

    try {
      const room = this.roomManager.getRoom(roomCode);
      if (!room) return;

      const updatedRoom = this.roomManager.removePlayer(roomCode, socket.id);
      socket.leave(roomCode);
      socket.data.roomCode = undefined;

      socket.emit('room:left');

      if (updatedRoom) {
        this.io.to(roomCode).emit('room:updated', updatedRoom);
        this.io.to(roomCode).emit('player:left', socket.id);

        // Update public room list
        if (!room.settings.isPrivate) {
          this.io.emit('room:list', this.roomManager.getPublicRooms());
        }
      }

      console.log(`${socket.data.name} left room ${roomCode}`);
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  }

  private handlePlayerReady(socket: Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>, isReady: boolean) {
    const roomCode = socket.data.roomCode;
    if (!roomCode) return;

    try {
      const updatedRoom = this.roomManager.setPlayerReady(roomCode, socket.id, isReady);
      if (updatedRoom) {
        this.io.to(roomCode).emit('room:updated', updatedRoom);
      }
    } catch (error) {
      console.error('Error setting player ready:', error);
    }
  }

  private handlePlayerSeat(socket: Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>, seatIndex: number) {
    const roomCode = socket.data.roomCode;
    if (!roomCode) return;

    try {
      const updatedRoom = this.roomManager.setPlayerSeat(roomCode, socket.id, seatIndex);
      if (updatedRoom) {
        this.io.to(roomCode).emit('room:updated', updatedRoom);
      }
    } catch (error: any) {
      socket.emit('room:error', error.message || 'Failed to change seat');
    }
  }

  private handleKickPlayer(socket: Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>, targetSocketId: string) {
    const roomCode = socket.data.roomCode;
    if (!roomCode) return;

    const room = this.roomManager.getRoom(roomCode);
    if (!room) return;

    // Only host can kick
    const player = room.players.find(p => p.socketId === socket.id);
    if (!player?.isHost) {
      socket.emit('room:error', 'Only host can kick players');
      return;
    }

    try {
      const kickedSocket = this.io.sockets.sockets.get(targetSocketId);
      if (kickedSocket) {
        kickedSocket.data.roomCode = undefined;
        kickedSocket.leave(roomCode);
        kickedSocket.emit('room:left');
        kickedSocket.emit('room:error', 'You have been kicked from the room');
      }

      const updatedRoom = this.roomManager.removePlayer(roomCode, targetSocketId);
      if (updatedRoom) {
        this.io.to(roomCode).emit('room:updated', updatedRoom);
        this.io.to(roomCode).emit('player:left', targetSocketId);
      }
    } catch (error) {
      console.error('Error kicking player:', error);
    }
  }

  private handleStartGame(socket: Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>) {
    const roomCode = socket.data.roomCode;
    if (!roomCode) return;

    const room = this.roomManager.getRoom(roomCode);
    if (!room) return;

    // Only host can start
    const player = room.players.find(p => p.socketId === socket.id);
    if (!player?.isHost) {
      socket.emit('room:error', 'Only host can start the game');
      return;
    }

    // Check if all players are ready
    if (room.players.length < 2) {
      socket.emit('room:error', 'Need at least 2 players');
      return;
    }

    const allReady = room.players.every(p => p.isReady);
    if (!allReady) {
      socket.emit('room:error', 'All players must be ready');
      return;
    }

    try {
      // Update room status
      const updatedRoom = this.roomManager.setRoomStatus(roomCode, 'playing');
      if (!updatedRoom) return;

      // Create game manager for this room
      const gameManager = new GameManager(
        roomCode,
        room.players,
        room.settings,
        (state) => this.io.to(roomCode).emit('game:updated', state),
        (socketId) => this.io.to(roomCode).emit('timer:tick', 0), // Timer expired, will auto-fold
        (seconds) => this.io.to(roomCode).emit('timer:tick', seconds)
      );

      this.gameManagers.set(roomCode, gameManager);

      const gameState = gameManager.startGame();
      this.io.to(roomCode).emit('game:started', gameState);

      // Update public room list
      if (!room.settings.isPrivate) {
        this.io.emit('room:list', this.roomManager.getPublicRooms());
      }

      console.log(`Game started in room ${roomCode}`);
    } catch (error: any) {
      socket.emit('room:error', error.message || 'Failed to start game');
    }
  }

  private handleGameAction(socket: Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>, action: MultiplayerAction, amount?: number) {
    const roomCode = socket.data.roomCode;
    if (!roomCode) return;

    const gameManager = this.gameManagers.get(roomCode);
    if (!gameManager) {
      socket.emit('room:error', 'Game not found');
      return;
    }

    try {
      const result = gameManager.processAction(socket.id, action, amount);

      if (result.error) {
        socket.emit('room:error', result.error);
        return;
      }

      this.io.to(roomCode).emit('game:updated', result.state!);

      if (result.state?.isGameOver) {
        this.io.to(roomCode).emit('game:ended', result.state.winners);

        // Clean up game manager
        gameManager.cleanup();
        this.gameManagers.delete(roomCode);

        // Reset room status
        this.roomManager.setRoomStatus(roomCode, 'finished');
      }
    } catch (error: any) {
      socket.emit('room:error', error.message || 'Failed to process action');
    }
  }

  private handleDisconnect(socket: Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>) {
    const roomCode = socket.data.roomCode;
    console.log(`Player disconnected: ${socket.data.name} (${socket.id})`);

    if (roomCode) {
      const room = this.roomManager.getRoom(roomCode);
      if (room) {
        if (room.status === 'playing') {
          // Mark player as disconnected but don't remove yet
          this.io.to(roomCode).emit('player:disconnected', socket.id);

          // Start reconnection timer (30 seconds)
          setTimeout(() => {
            if (!this.io.sockets.sockets.has(socket.id)) {
              // Player didn't reconnect, remove them
              const updatedRoom = this.roomManager.removePlayer(roomCode, socket.id);
              if (updatedRoom) {
                this.io.to(roomCode).emit('room:updated', updatedRoom);
                this.io.to(roomCode).emit('player:left', socket.id);
              }

              // Handle game state if game is in progress
              const gameManager = this.gameManagers.get(roomCode);
              if (gameManager) {
                gameManager.handlePlayerDisconnect(socket.id);
              }
            }
          }, 30000);
        } else {
          // In waiting room, remove immediately
          this.handleLeaveRoom(socket);
        }
      }
    }
  }
}
