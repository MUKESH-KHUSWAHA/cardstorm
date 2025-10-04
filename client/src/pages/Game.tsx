import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useSocket } from "@/hooks/useSocket";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import GameHeader from "@/components/GameHeader";
import GameBoard from "@/components/GameBoard";
import PlayerHand from "@/components/PlayerHand";
import PlayerArea from "@/components/PlayerArea";
import Leaderboard from "@/components/Leaderboard";
import GameModal from "@/components/GameModal";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { Card, GameStats, User } from "@shared/schema";

export default function Game() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { socket, connected, gameState, error, clearError, leaveGame } = useSocket();
  const { toast } = useToast();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [winnerName, setWinnerName] = useState("");
  const [selectedColor, setSelectedColor] = useState<"red" | "blue" | "green" | "yellow" | null>(null);

  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const { data: leaderboardData } = useQuery<Array<User & { stats: GameStats }>>({
    queryKey: ["/api/leaderboard"],
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      clearError();
    }
  }, [error, toast, clearError]);

  useEffect(() => {
    if (!socket || !connected) return;

    const handleGameEnded = (winnerId: string) => {
      const winner = gameState?.players.find(p => p.userId === winnerId);
      setWinnerName(winner?.username || "Someone");
      setShowWinModal(true);
    };

    socket.on("gameEnded", handleGameEnded);

    return () => {
      socket.off("gameEnded", handleGameEnded);
    };
  }, [socket, connected, gameState]);

  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-xl font-semibold mb-2">Connecting to game server...</div>
          <div className="text-muted-foreground">Please wait</div>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Start a Game</h2>
          <div className="space-y-4">
            <Button
              onClick={() => socket?.emit("createGame")}
              size="lg"
              className="w-full"
              data-testid="button-create-game"
            >
              Create New Game
            </Button>
            <Button
              onClick={() => setLocation("/lobby")}
              variant="outline"
              size="lg"
              className="w-full"
              data-testid="button-join-game"
            >
              Join Existing Game
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState.status === "waiting") {
    const isHost = gameState.hostId === user?.id;
    const lobbyPlayers = gameState.players.map(p => ({
      id: p.userId,
      username: p.username,
      avatar: p.avatar,
      isReady: true,
    }));

    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="text-center max-w-2xl w-full space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Game Lobby</h2>
            <p className="text-muted-foreground">
              Waiting for players ({gameState.players.length}/4)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {lobbyPlayers.map((player) => (
              <div
                key={player.id}
                data-testid={`lobby-player-${player.id}`}
                className="flex items-center gap-3 p-4 rounded-lg bg-card border"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold">
                  {player.username.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{player.username}</div>
                  <div className="text-xs text-muted-foreground">Ready</div>
                </div>
              </div>
            ))}
            {Array.from({ length: 4 - gameState.players.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center justify-center gap-3 p-4 rounded-lg border-2 border-dashed"
              >
                <span className="text-sm text-muted-foreground">Waiting for player</span>
              </div>
            ))}
          </div>

          {isHost && (
            <Button
              onClick={() => socket?.emit("startGame")}
              disabled={gameState.players.length < 2}
              size="lg"
              className="w-full"
              data-testid="button-start-game"
            >
              Start Game {gameState.players.length < 2 && "(need at least 2 players)"}
            </Button>
          )}

          {!isHost && (
            <p className="text-muted-foreground">Waiting for host to start the game...</p>
          )}

          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => {
                leaveGame();
                setLocation("/");
              }}
              variant="outline"
              data-testid="button-leave-game"
            >
              Leave Game
            </Button>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(gameState.id);
                toast({
                  title: "Game ID Copied!",
                  description: "Share this ID with friends to invite them",
                });
              }}
              variant="secondary"
              data-testid="button-copy-game-id"
            >
              Copy Game ID
            </Button>
          </div>
          
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground text-center mb-2">
              Share this Game ID with friends:
            </p>
            <p className="text-center font-mono text-sm font-semibold">
              {gameState.id}
            </p>
            <p className="text-xs text-muted-foreground text-center mt-2">
              They can join from the "Join Existing Game" screen
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (gameState.status !== "playing") {
    return null;
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const myPlayer = gameState.players.find(p => p.userId === user?.id);
  const isMyTurn = currentPlayer.userId === user?.id;
  const topCard = gameState.discardPile[gameState.discardPile.length - 1];

  const otherPlayers = gameState.players.filter(p => p.userId !== user?.id);

  const handlePlayCard = (cardId: string) => {
    const card = myPlayer?.hand.find(c => c.id === cardId);
    if (!card) return;

    if (card.type === "wild" || card.type === "wild-draw4") {
      if (!selectedColor) {
        toast({
          title: "Choose a color",
          description: "Select a color for the wild card",
        });
        return;
      }
      socket?.emit("playCard", cardId, selectedColor);
      setSelectedColor(null);
    } else {
      socket?.emit("playCard", cardId);
    }
  };

  const handleDrawCard = () => {
    socket?.emit("drawCard");
  };

  const isCardPlayable = (card: Card): boolean => {
    if (card.type === "wild" || card.type === "wild-draw4") return true;
    return card.color === topCard.color || card.value === topCard.value;
  };

  return (
    <div className="flex flex-col h-screen">
      <GameHeader
        currentRound={1}
        totalPlayers={gameState.players.length}
        onMenuClick={() => {}}
        onLeaderboardClick={() => setShowLeaderboard(!showLeaderboard)}
        onSettingsClick={() => setShowRules(true)}
        onLogoutClick={handleLogout}
      />

      <main className="flex-1 overflow-hidden flex">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-6xl space-y-8">
              {otherPlayers[0] && (
                <div className="flex justify-center">
                  <PlayerArea
                    username={otherPlayers[0].username}
                    avatar={otherPlayers[0].avatar}
                    cardCount={otherPlayers[0].hand.length}
                    isCurrentTurn={currentPlayer.userId === otherPlayers[0].userId}
                  />
                </div>
              )}

              <div className="flex items-center justify-between px-12">
                {otherPlayers[1] && (
                  <PlayerArea
                    username={otherPlayers[1].username}
                    avatar={otherPlayers[1].avatar}
                    cardCount={otherPlayers[1].hand.length}
                    isCurrentTurn={currentPlayer.userId === otherPlayers[1].userId}
                  />
                )}

                <GameBoard
                  topCard={topCard}
                  onDrawCard={handleDrawCard}
                  deckCount={30}
                />

                {otherPlayers[2] && (
                  <PlayerArea
                    username={otherPlayers[2].username}
                    avatar={otherPlayers[2].avatar}
                    cardCount={otherPlayers[2].hand.length}
                    isCurrentTurn={currentPlayer.userId === otherPlayers[2].userId}
                  />
                )}
              </div>

              {myPlayer && (
                <div className="flex justify-center">
                  <PlayerArea
                    username={myPlayer.username}
                    avatar={myPlayer.avatar}
                    cardCount={myPlayer.hand.length}
                    isCurrentTurn={isMyTurn}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="border-t bg-card/50 p-6">
            {myPlayer && (
              <PlayerHand
                cards={myPlayer.hand.map(card => ({
                  ...card,
                  isPlayable: isMyTurn && isCardPlayable(card),
                }))}
                onPlayCard={handlePlayCard}
                canPlay={isMyTurn}
              />
            )}
          </div>
        </div>

        {showLeaderboard && leaderboardData && (
          <div className="w-96 border-l p-6 overflow-y-auto">
            <Leaderboard
              entries={leaderboardData.map((entry, index) => ({
                rank: index + 1,
                username: entry.firstName || entry.email || "Player",
                avatar: entry.profileImageUrl || undefined,
                wins: entry.stats.gamesWon,
                gamesPlayed: entry.stats.gamesPlayed,
              }))}
            />
          </div>
        )}
      </main>

      <GameModal
        isOpen={showRules}
        onClose={() => setShowRules(false)}
        type="rules"
      />

      <GameModal
        isOpen={showWinModal}
        onClose={() => {
          setShowWinModal(false);
          setLocation("/");
        }}
        type={winnerName === myPlayer?.username ? "win" : "lose"}
        winner={winnerName}
        onPlayAgain={() => {
          setShowWinModal(false);
          socket?.emit("createGame");
        }}
      />
    </div>
  );
}
