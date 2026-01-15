import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/auth.service';
import { socketService } from '../../services/socket.service';
import type { MultiplayerRoom, MultiplayerRoomSettings } from '../../types';
import { CreateRoomModal } from './CreateRoomModal';
import { RoomView } from './RoomView';
import styles from './MultiplayerLobby.module.scss';

interface MultiplayerLobbyProps {
  onBack: () => void;
}

type LobbyView = 'main' | 'create' | 'room';

export const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({ onBack }) => {
  const { user } = useAuth();
  const token = authService.getToken();
  const [view, setView] = useState<LobbyView>('main');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState('');
  const [publicRooms, setPublicRooms] = useState<MultiplayerRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<MultiplayerRoom | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  // Connect to socket server
  useEffect(() => {
    if (!token) return;

    const connect = async () => {
      setIsConnecting(true);
      setError(null);
      try {
        await socketService.connect(token);
        setIsConnected(true);
      } catch (err) {
        setError('Failed to connect to multiplayer server');
        console.error(err);
      } finally {
        setIsConnecting(false);
      }
    };

    connect();

    return () => {
      socketService.disconnect();
    };
  }, [token]);

  // Set up socket event listeners
  useEffect(() => {
    const handleRoomCreated = (room: MultiplayerRoom) => {
      setCurrentRoom(room);
      setView('room');
    };

    const handleRoomJoined = (room: MultiplayerRoom) => {
      setCurrentRoom(room);
      setView('room');
      setIsJoining(false);
    };

    const handleRoomUpdated = (room: MultiplayerRoom) => {
      setCurrentRoom(room);
    };

    const handleRoomLeft = () => {
      setCurrentRoom(null);
      setView('main');
    };

    const handleRoomError = (message: string) => {
      setError(message);
      setIsJoining(false);
    };

    const handleRoomList = (rooms: MultiplayerRoom[]) => {
      setPublicRooms(rooms);
    };

    const handleDisconnected = () => {
      setIsConnected(false);
      setCurrentRoom(null);
      setView('main');
    };

    socketService.on('room:created', handleRoomCreated);
    socketService.on('room:joined', handleRoomJoined);
    socketService.on('room:updated', handleRoomUpdated);
    socketService.on('room:left', handleRoomLeft);
    socketService.on('room:error', handleRoomError);
    socketService.on('room:list', handleRoomList);
    socketService.on('disconnected', handleDisconnected);

    return () => {
      socketService.off('room:created', handleRoomCreated);
      socketService.off('room:joined', handleRoomJoined);
      socketService.off('room:updated', handleRoomUpdated);
      socketService.off('room:left', handleRoomLeft);
      socketService.off('room:error', handleRoomError);
      socketService.off('room:list', handleRoomList);
      socketService.off('disconnected', handleDisconnected);
    };
  }, []);

  const handleCreateRoom = useCallback((settings: MultiplayerRoomSettings) => {
    socketService.createRoom(settings);
    setView('main');
  }, []);

  const handleJoinRoom = useCallback(() => {
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }
    setError(null);
    setIsJoining(true);
    socketService.joinRoom(roomCode.trim().toUpperCase());
  }, [roomCode]);

  const handleJoinPublicRoom = useCallback((code: string) => {
    setIsJoining(true);
    socketService.joinRoom(code);
  }, []);

  const handleLeaveRoom = useCallback(() => {
    socketService.leaveRoom();
  }, []);

  // Loading/connecting state
  if (isConnecting) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Connecting to multiplayer server...</p>
        </div>
      </div>
    );
  }

  // Connection error
  if (!isConnected && !isConnecting) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <span className={styles.errorIcon}>!</span>
          <h2>Connection Failed</h2>
          <p>{error || 'Unable to connect to multiplayer server'}</p>
          <div className={styles.errorActions}>
            <button onClick={() => window.location.reload()} className={styles.retryButton}>
              Retry Connection
            </button>
            <button onClick={onBack} className={styles.backButton}>
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Room view
  if (view === 'room' && currentRoom) {
    return (
      <RoomView
        room={currentRoom}
        currentUserId={socketService.getSocketId() || ''}
        onLeave={handleLeaveRoom}
        onBack={onBack}
      />
    );
  }

  // Create room modal
  if (view === 'create') {
    return (
      <CreateRoomModal
        onClose={() => setView('main')}
        onCreate={handleCreateRoom}
      />
    );
  }

  // Main lobby view
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={onBack} className={styles.backBtn}>
          Back
        </button>
        <h1 className={styles.title}>Multiplayer Lobby</h1>
        <div className={styles.userInfo}>
          <span className={styles.connectionStatus} />
          {user?.email}
        </div>
      </div>

      <div className={styles.content}>
        {/* Join/Create Section */}
        <div className={styles.actions}>
          <div className={styles.joinSection}>
            <h3>Join a Room</h3>
            <div className={styles.joinInput}>
              <input
                type="text"
                placeholder="Enter room code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                className={styles.codeInput}
              />
              <button
                onClick={handleJoinRoom}
                disabled={isJoining || !roomCode.trim()}
                className={styles.joinBtn}
              >
                {isJoining ? 'Joining...' : 'Join'}
              </button>
            </div>
            {error && <p className={styles.errorMessage}>{error}</p>}
          </div>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <button onClick={() => setView('create')} className={styles.createBtn}>
            Create New Room
          </button>
        </div>

        {/* Public Rooms List */}
        <div className={styles.publicRooms}>
          <h3>Public Tables</h3>
          {publicRooms.length === 0 ? (
            <div className={styles.noRooms}>
              <p>No public tables available</p>
              <p className={styles.hint}>Create a room or wait for others to create public tables</p>
            </div>
          ) : (
            <div className={styles.roomList}>
              {publicRooms.map((room) => (
                <div key={room.roomCode} className={styles.roomCard}>
                  <div className={styles.roomInfo}>
                    <span className={styles.roomCode}>{room.roomCode}</span>
                    <span className={styles.roomPlayers}>
                      {room.players.length}/{room.settings.maxPlayers} players
                    </span>
                    <span className={styles.roomBlinds}>
                      {room.settings.smallBlind}/{room.settings.bigBlind}
                    </span>
                  </div>
                  <button
                    onClick={() => handleJoinPublicRoom(room.roomCode)}
                    disabled={room.players.length >= room.settings.maxPlayers || isJoining}
                    className={styles.joinRoomBtn}
                  >
                    Join
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
