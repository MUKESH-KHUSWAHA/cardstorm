import { useEffect, useState, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents, GameState } from "@shared/schema";
import { useAuth } from "./useAuth";

export function useSocket() {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState<Omit<GameState, "deck"> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();
  
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

  useEffect(() => {
    // Only connect to Socket.IO if user is authenticated
    if (!isAuthenticated || !user) {
      return;
    }

    console.log("Connecting to game server...");
    const newSocket = io({
      withCredentials: true,
      transports: ["websocket", "polling"],
      auth: {
        token: user.id // Use user ID as token for now, will be replaced with JWT
      }
    });

    newSocket.on("connect", () => {
      console.log("Connected to game server");
      setConnected(true);
      setError(null);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from game server");
      setConnected(false);
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
      setError(`Connection failed: ${err.message}`);
    });

    newSocket.on("gameState", (state) => {
      setGameState(state);
    });

    newSocket.on("error", (message) => {
      setError(message);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [isAuthenticated]);

  const leaveGame = () => {
    socket?.emit("leaveGame");
    setGameState(null);
  };

  return {
    socket,
    connected,
    gameState,
    error,
    clearError: () => setError(null),
    leaveGame,
  };
}
