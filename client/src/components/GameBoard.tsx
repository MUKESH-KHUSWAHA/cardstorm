import { Button } from "@/components/ui/button";
import PlayingCard from "./PlayingCard";
import { Plus } from "lucide-react";

interface GameBoardProps {
  topCard: {
    color: "red" | "blue" | "green" | "yellow" | "wild";
    value: string | number;
    type?: "number" | "skip" | "reverse" | "draw2" | "wild" | "wild-draw4";
  };
  onDrawCard?: () => void;
  deckCount: number;
}

export default function GameBoard({ topCard, onDrawCard, deckCount }: GameBoardProps) {
  return (
    <div className="flex items-center justify-center gap-12" data-testid="game-board">
      <div className="text-center space-y-3">
        <div className="text-sm text-muted-foreground font-medium">Draw Pile</div>
        <div className="relative">
          <PlayingCard color="red" value={0} isFaceDown className="absolute top-1 left-1 opacity-50" />
          <PlayingCard color="red" value={0} isFaceDown className="absolute top-0.5 left-0.5 opacity-75" />
          <PlayingCard color="red" value={0} isFaceDown />
        </div>
        <Button
          onClick={onDrawCard}
          size="sm"
          variant="outline"
          className="w-full"
          data-testid="button-draw-card"
        >
          <Plus className="h-4 w-4 mr-1" />
          Draw ({deckCount})
        </Button>
      </div>

      <div className="text-center space-y-3">
        <div className="text-sm text-muted-foreground font-medium">Discard Pile</div>
        <div className="relative" data-testid="discard-pile">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
          <PlayingCard
            color={topCard.color}
            value={topCard.value}
            type={topCard.type}
            isPlayable={false}
            className="scale-110 shadow-2xl relative z-10"
          />
        </div>
      </div>
    </div>
  );
}
