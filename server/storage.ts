// Storage layer with Replit Auth integration
import {
  users,
  gameStats,
  matchHistory,
  type User,
  type UpsertUser,
  type GameStats,
  type InsertGameStats,
  type MatchHistory,
  type InsertMatchHistory,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (Independent Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<UpsertUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Game stats operations
  getGameStats(userId: string): Promise<GameStats | undefined>;
  createOrUpdateGameStats(userId: string, data: Partial<InsertGameStats>): Promise<GameStats>;
  incrementGamesPlayed(userId: string): Promise<void>;
  incrementGamesWon(userId: string): Promise<void>;
  
  // Leaderboard operations
  getLeaderboard(limit?: number): Promise<Array<User & { stats: GameStats }>>;
  
  // Match history operations
  createMatchHistory(data: InsertMatchHistory): Promise<MatchHistory>;
  getMatchHistory(userId: string, limit?: number): Promise<MatchHistory[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (Independent Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: Omit<UpsertUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    await this.ensureGameStats(user.id);
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();

    await this.ensureGameStats(user.id);
    return user;
  }

  // Game stats operations
  async getGameStats(userId: string): Promise<GameStats | undefined> {
    const [stats] = await db.select().from(gameStats).where(eq(gameStats.userId, userId));
    return stats;
  }

  private async ensureGameStats(userId: string): Promise<GameStats> {
    let stats = await this.getGameStats(userId);
    if (!stats) {
      const [newStats] = await db
        .insert(gameStats)
        .values({ userId })
        .returning();
      stats = newStats;
    }
    return stats;
  }

  async createOrUpdateGameStats(userId: string, data: Partial<InsertGameStats>): Promise<GameStats> {
    const existing = await this.getGameStats(userId);
    if (existing) {
      const [updated] = await db
        .update(gameStats)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(gameStats.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(gameStats)
        .values({ userId, ...data })
        .returning();
      return created;
    }
  }

  async incrementGamesPlayed(userId: string): Promise<void> {
    await db
      .update(gameStats)
      .set({
        gamesPlayed: sql`${gameStats.gamesPlayed} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(gameStats.userId, userId));
  }

  async incrementGamesWon(userId: string): Promise<void> {
    await db
      .update(gameStats)
      .set({
        gamesWon: sql`${gameStats.gamesWon} + 1`,
        gamesPlayed: sql`${gameStats.gamesPlayed} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(gameStats.userId, userId));
  }

  // Leaderboard operations
  async getLeaderboard(limit: number = 10): Promise<Array<User & { stats: GameStats }>> {
    const results = await db
      .select({
        user: users,
        stats: gameStats,
      })
      .from(users)
      .innerJoin(gameStats, eq(users.id, gameStats.userId))
      .orderBy(desc(gameStats.gamesWon))
      .limit(limit);

    return results.map(r => ({ ...r.user, stats: r.stats }));
  }

  // Match history operations
  async createMatchHistory(data: InsertMatchHistory): Promise<MatchHistory> {
    const [match] = await db.insert(matchHistory).values(data).returning();
    return match;
  }

  async getMatchHistory(userId: string, limit: number = 20): Promise<MatchHistory[]> {
    return await db
      .select()
      .from(matchHistory)
      .where(sql`${userId} = ANY(${matchHistory.playerIds})`)
      .orderBy(desc(matchHistory.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
