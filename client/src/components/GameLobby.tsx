import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Play, Loader2 } from "lucide-react";

interface LobbyPlayer {
  id: string;
  username: string;
  avatar?: string;
  isReady?: boolean;
}

interface GameLobbyProps {
  players: LobbyPlayer[];
  maxPlayers?: number;
  isHost?: boolean;
  isReady?: boolean;
  onToggleReady?: () => void;
  onStartGame?: () => void;
  isSearching?: boolean;
}

export default function GameLobby({
  players,
  maxPlayers = 4,
  isHost = false,
  isReady = false,
  onToggleReady,
  onStartGame,
  isSearching = false,
}: GameLobbyProps) {
  const canStart = isHost && players.length >= 3 && players.every(p => p.isReady);

  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Game Lobby</CardTitle>
              <CardDescription>
                Waiting for players ({players.length}/{maxPlayers})
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm">
              <Users className="h-4 w-4 mr-1" />
              {players.length}/{maxPlayers}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {players.map((player) => (
              <div
                key={player.id}
                data-testid={`lobby-player-${player.id}`}
                className="flex items-center gap-3 p-4 rounded-lg bg-muted/50"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={player.avatar} alt={player.username} />
                  <AvatarFallback>{player.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{player.username}</div>
                  <Badge
                    variant={player.isReady ? "default" : "secondary"}
                    className="text-xs mt-1"
                  >
                    {player.isReady ? "Ready" : "Not Ready"}
                  </Badge>
                </div>
              </div>
            ))}
            {Array.from({ length: maxPlayers - players.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center justify-center gap-3 p-4 rounded-lg border-2 border-dashed border-border"
              >
                {isSearching ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Searching...</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Waiting for player</span>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            {!isHost && (
              <Button
                onClick={onToggleReady}
                variant={isReady ? "secondary" : "default"}
                className="flex-1"
                data-testid="button-ready"
              >
                {isReady ? "Not Ready" : "Ready"}
              </Button>
            )}
            {isHost && (
              <Button
                onClick={onStartGame}
                disabled={!canStart}
                className="flex-1"
                data-testid="button-start-game"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Game
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
