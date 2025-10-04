import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PlayerAreaProps {
  username: string;
  avatar?: string;
  cardCount: number;
  isCurrentTurn?: boolean;
  isOnline?: boolean;
  position?: "top" | "left" | "right" | "bottom";
  className?: string;
}

export default function PlayerArea({
  username,
  avatar,
  cardCount,
  isCurrentTurn = false,
  isOnline = true,
  position = "bottom",
  className,
}: PlayerAreaProps) {
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <div
      data-testid={`player-area-${username}`}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg transition-all",
        isCurrentTurn && "bg-primary/10 ring-2 ring-primary",
        className
      )}
    >
      <div className="relative">
        <Avatar className={cn(
          "h-12 w-12 border-2 transition-colors",
          isCurrentTurn ? "border-primary" : "border-border"
        )}>
          <AvatarImage src={avatar} alt={username} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div
          className={cn(
            "absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-card",
            isOnline ? "bg-status-online" : "bg-status-offline"
          )}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate" data-testid={`text-username-${username}`}>
          {username}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Badge
            variant="secondary"
            className="text-xs"
            data-testid={`badge-cards-${username}`}
          >
            {cardCount} {cardCount === 1 ? "card" : "cards"}
          </Badge>
          {isCurrentTurn && (
            <Badge variant="default" className="text-xs">
              Your turn
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
