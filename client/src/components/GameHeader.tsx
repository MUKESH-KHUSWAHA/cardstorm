import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, Trophy, Settings, LogOut } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

interface GameHeaderProps {
  currentRound?: number;
  totalPlayers?: number;
  onMenuClick?: () => void;
  onLeaderboardClick?: () => void;
  onSettingsClick?: () => void;
  onLogoutClick?: () => void;
}

export default function GameHeader({
  currentRound = 1,
  totalPlayers = 4,
  onMenuClick,
  onLeaderboardClick,
  onSettingsClick,
  onLogoutClick,
}: GameHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            data-testid="button-menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-chart-3 bg-clip-text text-transparent">
              CardStorm
            </h1>
            <Badge variant="secondary" className="text-xs">
              Round {currentRound}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs" data-testid="badge-players">
            {totalPlayers} Players
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLeaderboardClick}
            data-testid="button-leaderboard"
          >
            <Trophy className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onSettingsClick}
            data-testid="button-settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogoutClick}
            data-testid="button-logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
