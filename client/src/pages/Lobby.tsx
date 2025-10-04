import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useSocket } from "@/hooks/useSocket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, ArrowLeft, RefreshCw, Hash } from "lucide-react";

interface AvailableGame {
  id: string;
  hostId: string;
  playerCount: number;
  players: Array<{
    userId: string;
    username: string;
    avatar?: string;
  }>;
}

export default function Lobby() {
  const [, setLocation] = useLocation();
  const { socket, gameState } = useSocket();
  const [gameIdInput, setGameIdInput] = useState("");

  const { data: games, refetch, isLoading } = useQuery<AvailableGame[]>({
    queryKey: ["/api/games"],
    refetchInterval: 3000,
  });

  useEffect(() => {
    if (gameState) {
      setLocation("/");
    }
  }, [gameState, setLocation]);

  const handleJoinGame = (gameId: string) => {
    socket?.emit("joinGame", gameId);
  };

  const handleJoinWithId = () => {
    if (gameIdInput.trim()) {
      handleJoinGame(gameIdInput.trim());
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <Button
            onClick={() => setLocation("/")}
            variant="ghost"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            data-testid="button-refresh"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Join with Game ID</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Paste Game ID here..."
                  value={gameIdInput}
                  onChange={(e) => setGameIdInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleJoinWithId()}
                  className="pl-9"
                  data-testid="input-game-id"
                />
              </div>
              <Button
                onClick={handleJoinWithId}
                disabled={!gameIdInput.trim()}
                data-testid="button-join-with-id"
              >
                Join Game
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Available Games</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading games...
              </div>
            ) : games && games.length > 0 ? (
              <div className="space-y-3">
                {games.map((game) => (
                  <div
                    key={game.id}
                    data-testid={`game-${game.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline">
                          <Users className="h-3 w-3 mr-1" />
                          {game.playerCount}/4
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Host: {game.players[0]?.username || "Unknown"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {game.players.map((player) => (
                          <div
                            key={player.userId}
                            className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded"
                          >
                            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                              {player.username.slice(0, 1).toUpperCase()}
                            </div>
                            {player.username}
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleJoinGame(game.id)}
                      data-testid={`button-join-${game.id}`}
                    >
                      Join Game
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  No games available right now
                </div>
                <Button
                  onClick={() => setLocation("/")}
                  data-testid="button-create-new"
                >
                  Create New Game
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
