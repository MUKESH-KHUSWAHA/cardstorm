// Replit Auth integration - Session and User tables (mandatory)
import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  integer,
  text,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (Replit Auth - mandatory)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (Independent Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  hashedPassword: varchar("hashed_password").notNull(),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Game statistics table
export const gameStats = pgTable("game_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  gamesPlayed: integer("games_played").notNull().default(0),
  gamesWon: integer("games_won").notNull().default(0),
  totalCardsPlayed: integer("total_cards_played").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertGameStatsSchema = createInsertSchema(gameStats).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertGameStats = z.infer<typeof insertGameStatsSchema>;
export type GameStats = typeof gameStats.$inferSelect;

// Match history table
export const matchHistory = pgTable("match_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  winnerId: varchar("winner_id").notNull().references(() => users.id),
  playerIds: text("player_ids").array().notNull(),
  finalScores: jsonb("final_scores").notNull(),
  duration: integer("duration"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMatchHistorySchema = createInsertSchema(matchHistory).omit({
  id: true,
  createdAt: true,
});

export type InsertMatchHistory = z.infer<typeof insertMatchHistorySchema>;
export type MatchHistory = typeof matchHistory.$inferSelect;

// Card types
export type CardColor = "red" | "blue" | "green" | "yellow" | "wild";
export type CardType = "number" | "skip" | "reverse" | "draw2" | "wild" | "wild-draw4";

export interface Card {
  id: string;
  color: CardColor;
  value: string | number;
  type: CardType;
}

// Game state
export type GameDirection = "clockwise" | "counterclockwise";

export interface PlayerState {
  userId: string;
  username: string;
  avatar?: string;
  hand: Card[];
  hasDrawn: boolean;
}

export interface GameState {
  id: string;
  players: PlayerState[];
  deck: Card[];
  discardPile: Card[];
  currentPlayerIndex: number;
  direction: GameDirection;
  status: "waiting" | "playing" | "finished";
  winnerId?: string;
  hostId: string;
  createdAt: Date;
}

// Socket events
export interface ServerToClientEvents {
  gameState: (state: Omit<GameState, "deck">) => void;
  playerJoined: (player: { userId: string; username: string; avatar?: string }) => void;
  playerLeft: (userId: string) => void;
  gameStarted: () => void;
  cardPlayed: (data: { userId: string; card: Card }) => void;
  cardDrawn: (data: { userId: string; count: number }) => void;
  turnChanged: (userId: string) => void;
  gameEnded: (winnerId: string) => void;
  error: (message: string) => void;
}

export interface ClientToServerEvents {
  createGame: () => void;
  joinGame: (gameId: string) => void;
  leaveGame: () => void;
  startGame: () => void;
  playCard: (cardId: string, chosenColor?: CardColor) => void;
  drawCard: () => void;
}
