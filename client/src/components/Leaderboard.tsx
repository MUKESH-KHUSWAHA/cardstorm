import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar?: string;
  wins: number;
  gamesPlayed: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  className?: string;
}

export default function Leaderboard({ entries, className }: LeaderboardProps) {
  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-chart-3";
      case 2:
        return "text-muted-foreground";
      case 3:
        return "text-chart-4";
      default:
        return "";
    }
  };

  return (
    <Card className={cn("w-80", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {entries.map((entry) => (
          <div
            key={entry.rank}
            data-testid={`leaderboard-entry-${entry.rank}`}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg transition-colors hover-elevate",
              entry.rank <= 3 && "bg-muted/50"
            )}
          >
            <div className="flex items-center justify-center w-8">
              {entry.rank <= 3 ? (
                <Medal className={cn("h-6 w-6", getMedalColor(entry.rank))} />
              ) : (
                <span className="text-sm font-semibold text-muted-foreground">
                  {entry.rank}
                </span>
              )}
            </div>
            <Avatar className="h-10 w-10">
              <AvatarImage src={entry.avatar} alt={entry.username} />
              <AvatarFallback>{entry.username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{entry.username}</div>
              <div className="text-xs text-muted-foreground">
                {entry.gamesPlayed} games
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {entry.wins}W
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
