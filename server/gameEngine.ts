import { randomUUID } from "crypto";
import type {
  Card,
  CardColor,
  CardType,
  GameState,
  PlayerState,
  GameDirection,
} from "@shared/schema";

export class GameEngine {
  private games: Map<string, GameState> = new Map();

  createGame(hostId: string, hostUsername: string, hostAvatar?: string): GameState {
    const gameId = randomUUID();
    const game: GameState = {
      id: gameId,
      players: [{
        userId: hostId,
        username: hostUsername,
        avatar: hostAvatar,
        hand: [],
        hasDrawn: false,
      }],
      deck: [],
      discardPile: [],
      currentPlayerIndex: 0,
      direction: "clockwise",
      status: "waiting",
      hostId,
      createdAt: new Date(),
    };

    this.games.set(gameId, game);
    return game;
  }

  getGame(gameId: string): GameState | undefined {
    return this.games.get(gameId);
  }

  getAllGames(): GameState[] {
    return Array.from(this.games.values());
  }

  joinGame(gameId: string, userId: string, username: string, avatar?: string): GameState | null {
    const game = this.games.get(gameId);
    if (!game || game.status !== "waiting" || game.players.length >= 4) {
      return null;
    }

    if (game.players.some(p => p.userId === userId)) {
      return game;
    }

    game.players.push({
      userId,
      username,
      avatar,
      hand: [],
      hasDrawn: false,
    });

    return game;
  }

  leaveGame(gameId: string, userId: string): void {
    const game = this.games.get(gameId);
    if (!game) return;

    game.players = game.players.filter(p => p.userId !== userId);

    if (game.players.length === 0 || (game.status === "playing" && game.players.length < 2)) {
      this.games.delete(gameId);
    } else if (game.hostId === userId && game.players.length > 0) {
      game.hostId = game.players[0].userId;
    }
  }

  startGame(gameId: string): GameState | null {
    const game = this.games.get(gameId);
    if (!game || game.status !== "waiting" || game.players.length < 2) {
      return null;
    }

    game.deck = this.createDeck();
    game.deck = this.shuffleDeck(game.deck);

    game.players.forEach(player => {
      player.hand = game.deck.splice(0, 7);
      player.hasDrawn = false;
    });

    const firstCard = game.deck.pop()!;
    game.discardPile = [firstCard];

    game.status = "playing";
    game.currentPlayerIndex = 0;

    return game;
  }

  playCard(
    gameId: string,
    userId: string,
    cardId: string,
    chosenColor?: CardColor
  ): { success: boolean; game?: GameState; error?: string } {
    const game = this.games.get(gameId);
    if (!game || game.status !== "playing") {
      return { success: false, error: "Game not found or not in play" };
    }

    const currentPlayer = game.players[game.currentPlayerIndex];
    if (currentPlayer.userId !== userId) {
      return { success: false, error: "Not your turn" };
    }

    const cardIndex = currentPlayer.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {
      return { success: false, error: "Card not in hand" };
    }

    const card = currentPlayer.hand[cardIndex];
    const topCard = game.discardPile[game.discardPile.length - 1];

    if (!this.isValidPlay(card, topCard)) {
      return { success: false, error: "Invalid card play" };
    }

    currentPlayer.hand.splice(cardIndex, 1);
    
    if (card.type === "wild" || card.type === "wild-draw4") {
      if (!chosenColor || !["red", "blue", "green", "yellow"].includes(chosenColor)) {
        return { success: false, error: "Must choose a color for wild card" };
      }
      card.color = chosenColor;
    }

    game.discardPile.push(card);
    currentPlayer.hasDrawn = false;

    if (currentPlayer.hand.length === 0) {
      game.status = "finished";
      game.winnerId = userId;
      return { success: true, game };
    }

    this.applyCardEffect(game, card);
    this.nextTurn(game);

    return { success: true, game };
  }

  drawCard(gameId: string, userId: string): { success: boolean; game?: GameState; cards?: Card[]; error?: string } {
    const game = this.games.get(gameId);
    if (!game || game.status !== "playing") {
      return { success: false, error: "Game not found or not in play" };
    }

    const currentPlayer = game.players[game.currentPlayerIndex];
    if (currentPlayer.userId !== userId) {
      return { success: false, error: "Not your turn" };
    }

    if (currentPlayer.hasDrawn) {
      return { success: false, error: "Already drew this turn" };
    }

    if (game.deck.length === 0) {
      game.deck = game.discardPile.splice(0, game.discardPile.length - 1);
      game.deck = this.shuffleDeck(game.deck);
    }

    const drawnCards = game.deck.splice(0, 1);
    currentPlayer.hand.push(...drawnCards);
    currentPlayer.hasDrawn = true;

    return { success: true, game, cards: drawnCards };
  }

  private createDeck(): Card[] {
    const deck: Card[] = [];
    const colors: CardColor[] = ["red", "blue", "green", "yellow"];
    
    colors.forEach(color => {
      deck.push({ id: randomUUID(), color, value: 0, type: "number" });
      
      for (let i = 1; i <= 9; i++) {
        deck.push({ id: randomUUID(), color, value: i, type: "number" });
        deck.push({ id: randomUUID(), color, value: i, type: "number" });
      }
      
      for (let i = 0; i < 2; i++) {
        deck.push({ id: randomUUID(), color, value: "Skip", type: "skip" });
        deck.push({ id: randomUUID(), color, value: "Reverse", type: "reverse" });
        deck.push({ id: randomUUID(), color, value: "+2", type: "draw2" });
      }
    });

    for (let i = 0; i < 4; i++) {
      deck.push({ id: randomUUID(), color: "wild", value: "Wild", type: "wild" });
      deck.push({ id: randomUUID(), color: "wild", value: "+4", type: "wild-draw4" });
    }

    return deck;
  }

  private shuffleDeck(deck: Card[]): Card[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.map(card => {
      if (card.type === "wild" || card.type === "wild-draw4") {
        return { ...card, color: "wild" };
      }
      return card;
    });
  }

  private isValidPlay(card: Card, topCard: Card): boolean {
    if (card.type === "wild" || card.type === "wild-draw4") {
      return true;
    }
    return card.color === topCard.color || card.value === topCard.value;
  }

  private applyCardEffect(game: GameState, card: Card): void {
    if (card.type === "reverse") {
      game.direction = game.direction === "clockwise" ? "counterclockwise" : "clockwise";
      if (game.players.length === 2) {
        this.nextTurn(game);
      }
    } else if (card.type === "skip") {
      this.nextTurn(game);
    } else if (card.type === "draw2") {
      const nextPlayerIndex = this.getNextPlayerIndex(game);
      const nextPlayer = game.players[nextPlayerIndex];
      const drawnCards = game.deck.splice(0, 2);
      nextPlayer.hand.push(...drawnCards);
      this.nextTurn(game);
    } else if (card.type === "wild-draw4") {
      const nextPlayerIndex = this.getNextPlayerIndex(game);
      const nextPlayer = game.players[nextPlayerIndex];
      const drawnCards = game.deck.splice(0, 4);
      nextPlayer.hand.push(...drawnCards);
      this.nextTurn(game);
    }
  }

  private getNextPlayerIndex(game: GameState): number {
    const increment = game.direction === "clockwise" ? 1 : -1;
    return (game.currentPlayerIndex + increment + game.players.length) % game.players.length;
  }

  private nextTurn(game: GameState): void {
    game.currentPlayerIndex = this.getNextPlayerIndex(game);
    game.players[game.currentPlayerIndex].hasDrawn = false;
  }

  getPublicGameState(game: GameState): Omit<GameState, "deck"> {
    const { deck, ...publicState } = game;
    return publicState;
  }

  getPlayerGameState(game: GameState, userId: string): Omit<GameState, "deck"> {
    const { deck, ...gameData } = game;
    
    return {
      ...gameData,
      players: gameData.players.map(player => ({
        ...player,
        hand: player.userId === userId ? player.hand : [],
      })),
    };
  }
}

export const gameEngine = new GameEngine();
