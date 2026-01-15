import {
  MultiplayerRoom,
  MultiplayerRoomSettings,
  OnlinePlayer,
  RoomStatus
} from '../types/multiplayer.types';

export class RoomManager {
  private rooms: Map<string, MultiplayerRoom> = new Map();

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Ensure uniqueness
    if (this.rooms.has(code)) {
      return this.generateRoomCode();
    }
    return code;
  }

  createRoom(settings: MultiplayerRoomSettings, host: OnlinePlayer): MultiplayerRoom {
    const roomCode = this.generateRoomCode();

    const room: MultiplayerRoom = {
      roomCode,
      hostId: host.socketId,
      settings,
      players: [host],
      status: 'waiting',
      createdAt: Date.now(),
      currentHandNumber: 0
    };

    this.rooms.set(roomCode, room);
    return room;
  }

  getRoom(roomCode: string): MultiplayerRoom | undefined {
    return this.rooms.get(roomCode);
  }

  getPublicRooms(): MultiplayerRoom[] {
    return Array.from(this.rooms.values()).filter(
      room => !room.settings.isPrivate && room.status === 'waiting'
    );
  }

  addPlayer(roomCode: string, player: OnlinePlayer): MultiplayerRoom {
    const room = this.rooms.get(roomCode);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.players.length >= room.settings.maxPlayers) {
      throw new Error('Room is full');
    }

    if (room.status !== 'waiting') {
      throw new Error('Game already in progress');
    }

    // Check if player already in room
    const existingPlayer = room.players.find(p => p.socketId === player.socketId);
    if (existingPlayer) {
      throw new Error('Already in room');
    }

    room.players.push(player);
    return room;
  }

  removePlayer(roomCode: string, socketId: string): MultiplayerRoom | null {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    const playerIndex = room.players.findIndex(p => p.socketId === socketId);
    if (playerIndex === -1) return room;

    const wasHost = room.players[playerIndex].isHost;
    room.players.splice(playerIndex, 1);

    // If room is empty, delete it
    if (room.players.length === 0) {
      this.rooms.delete(roomCode);
      return null;
    }

    // If host left, transfer host to next player
    if (wasHost && room.players.length > 0) {
      room.players[0].isHost = true;
      room.hostId = room.players[0].socketId;
    }

    return room;
  }

  setPlayerReady(roomCode: string, socketId: string, isReady: boolean): MultiplayerRoom | null {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    const player = room.players.find(p => p.socketId === socketId);
    if (player) {
      player.isReady = isReady;
    }

    return room;
  }

  setPlayerSeat(roomCode: string, socketId: string, seatIndex: number): MultiplayerRoom {
    const room = this.rooms.get(roomCode);
    if (!room) {
      throw new Error('Room not found');
    }

    if (seatIndex < 0 || seatIndex >= room.settings.maxPlayers) {
      throw new Error('Invalid seat');
    }

    // Check if seat is taken
    const seatTaken = room.players.some(p => p.seatIndex === seatIndex && p.socketId !== socketId);
    if (seatTaken) {
      throw new Error('Seat is taken');
    }

    const player = room.players.find(p => p.socketId === socketId);
    if (player) {
      player.seatIndex = seatIndex;
    }

    return room;
  }

  setRoomStatus(roomCode: string, status: RoomStatus): MultiplayerRoom | null {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    room.status = status;

    if (status === 'playing') {
      room.currentHandNumber++;
    }

    return room;
  }

  updatePlayerChips(roomCode: string, socketId: string, chips: number): void {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    const player = room.players.find(p => p.socketId === socketId);
    if (player) {
      player.chips = chips;
    }
  }

  deleteRoom(roomCode: string): void {
    this.rooms.delete(roomCode);
  }
}
