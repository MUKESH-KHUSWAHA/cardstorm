// API routes with Socket.IO integration
import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, getSession } from "./auth";
import { gameEngine } from "./gameEngine";
import type { ServerToClientEvents, ClientToServerEvents, CardColor } from "@shared/schema";
import type { Socket } from "socket.io";

interface SocketData {
  userId: string;
  username: string;
  avatar?: string;
  gameId?: string;
}

interface AuthenticatedSocket extends Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData> {
  auth?: { token?: string };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Independent Auth
  await setupAuth(app);

  // Create HTTP server
  const server = createServer(app);

  // Setup Socket.IO
  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents, {}, SocketData>(server, {
    cors: {
      origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:5173", "http://localhost:3000"],
      credentials: true,
    },
  });

  // Socket.IO middleware for authentication
  io.use(async (socket: AuthenticatedSocket, next) => {
    console.log("Socket.IO connection attempt");
    
    try {
      // Get token from auth object or session
      const req = socket.request as any;
      let token = socket.auth?.token;
      
      if (!token && req.session?.token) {
        token = req.session.token;
      }
      
      if (!token) {
        console.log("Socket authentication failed - no token");
        return next(new Error("Not authenticated"));
      }
      
      // Verify token and get user
      const { authenticateSocket } = await import("./auth");
      const user = await authenticateSocket(token);
      
      socket.data.userId = user.id;
      socket.data.username = user.firstName || user.email || "Player";
      socket.data.avatar = user.profileImageUrl || undefined;
      
      console.log("Socket authentication successful for user:", socket.data.username);
      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.data.username);

    socket.on("createGame", () => {
      try {
        const game = gameEngine.createGame(socket.data.userId, socket.data.username, socket.data.avatar);
        socket.join(game.id);
        socket.data.gameId = game.id;
        socket.emit("gameState", gameEngine.getPublicGameState(game));
        console.log(`Game ${game.id} created by ${socket.data.username}`);
      } catch (error) {
        console.error("Error creating game:", error);
        socket.emit("error", "Failed to create game");
      }
    });

    socket.on("joinGame", (gameId: string) => {
      try {
        const game = gameEngine.joinGame(gameId, socket.data.userId, socket.data.username, socket.data.avatar);
        if (game) {
          socket.join(gameId);
          socket.data.gameId = gameId;
          io.to(gameId).emit("gameState", gameEngine.getPublicGameState(game));
          io.to(gameId).emit("playerJoined", {
            userId: socket.data.userId,
            username: socket.data.username,
            avatar: socket.data.avatar,
          });
          console.log(`${socket.data.username} joined game ${gameId}`);
        } else {
          socket.emit("error", "Failed to join game");
        }
      } catch (error) {
        console.error("Error joining game:", error);
        socket.emit("error", "Failed to join game");
      }
    });

    socket.on("leaveGame", () => {
      if (socket.data.gameId) {
        try {
          const gameId = socket.data.gameId;
          gameEngine.leaveGame(gameId, socket.data.userId);
          socket.leave(gameId);
          const game = gameEngine.getGame(gameId);
          if (game) {
            io.to(gameId).emit("gameState", gameEngine.getPublicGameState(game));
            io.to(gameId).emit("playerLeft", socket.data.userId);
          }
          socket.data.gameId = undefined;
          console.log(`${socket.data.username} left game ${gameId}`);
        } catch (error) {
          console.error("Error leaving game:", error);
          socket.emit("error", "Failed to leave game");
        }
      }
    });

    socket.on("startGame", () => {
      if (socket.data.gameId) {
        try {
          const gameId = socket.data.gameId;
          const game = gameEngine.startGame(gameId);
          if (game) {
            io.to(gameId).emit("gameState", gameEngine.getPublicGameState(game));
            io.to(gameId).emit("gameStarted");
            console.log(`Game ${gameId} started by ${socket.data.username}`);
          } else {
            socket.emit("error", "Failed to start game");
          }
        } catch (error) {
          console.error("Error starting game:", error);
          socket.emit("error", "Failed to start game");
        }
      }
    });

    socket.on("playCard", async (cardId: string, chosenColor?: CardColor) => {
      if (socket.data.gameId) {
        try {
          const gameId = socket.data.gameId;
          const result = gameEngine.playCard(gameId, socket.data.userId, cardId, chosenColor);
          if (result.success && result.game) {
            io.to(gameId).emit("gameState", gameEngine.getPublicGameState(result.game));
            io.to(gameId).emit("turnChanged", result.game.players[result.game.currentPlayerIndex].userId);
            
            // Check if game ended
            if (result.game.status === "finished" && result.game.winnerId) {
              io.to(gameId).emit("gameEnded", result.game.winnerId);
              // Update game statistics
              for (const player of result.game.players) {
                await storage.incrementGamesPlayed(player.userId);
                if (player.userId === result.game.winnerId) {
                  await storage.incrementGamesWon(player.userId);
                }
              }
            }
          } else {
            socket.emit("error", result.error || "Failed to play card");
          }
        } catch (error) {
          console.error("Error playing card:", error);
          socket.emit("error", "Failed to play card");
        }
      }
    });

    socket.on("drawCard", () => {
      if (socket.data.gameId) {
        try {
          const gameId = socket.data.gameId;
          const result = gameEngine.drawCard(gameId, socket.data.userId);
          if (result.success && result.game) {
            socket.emit("gameState", gameEngine.getPlayerGameState(result.game, socket.data.userId));
            io.to(gameId).emit("cardDrawn", {
              userId: socket.data.userId,
              count: result.cards?.length || 1,
            });
          } else {
            socket.emit("error", result.error || "Failed to draw card");
          }
        } catch (error) {
          console.error("Error drawing card:", error);
          socket.emit("error", "Failed to draw card");
        }
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.data.username);
      if (socket.data.gameId) {
        try {
          const gameId = socket.data.gameId;
          gameEngine.leaveGame(gameId, socket.data.userId);
          const game = gameEngine.getGame(gameId);
          if (game) {
            io.to(gameId).emit("gameState", gameEngine.getPublicGameState(game));
            io.to(gameId).emit("playerLeft", socket.data.userId);
          }
        } catch (error) {
          console.error("Error handling disconnect:", error);
        }
      }
    });
  });

  // Protected API routes
  app.get("/api/leaderboard", isAuthenticated, async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard(10);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error getting leaderboard:", error);
      res.status(500).json({ message: "Failed to get leaderboard" });
    }
  });

  app.get("/api/match-history", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const matchHistory = await storage.getMatchHistory(userId, 20);
      res.json(matchHistory);
    } catch (error) {
      console.error("Error getting match history:", error);
      res.status(500).json({ message: "Failed to get match history" });
    }
  });

  app.get("/api/game-stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const stats = await storage.getGameStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error getting game stats:", error);
      res.status(500).json({ message: "Failed to get game stats" });
    }
  });

  return server;
}