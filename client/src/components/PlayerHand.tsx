import { useState } from "react";
import PlayingCard from "./PlayingCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface Card {
  id: string;
  color: "red" | "blue" | "green" | "yellow" | "wild";
  value: string | number;
  type?: "number" | "skip" | "reverse" | "draw2" | "wild" | "wild-draw4";
  isPlayable?: boolean;
}

interface PlayerHandProps {
  cards: Card[];
  onPlayCard?: (cardId: string) => void;
  canPlay?: boolean;
}

export default function PlayerHand({ cards, onPlayCard, canPlay = true }: PlayerHandProps) {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const handleCardClick = (cardId: string) => {
    if (!canPlay) return;
    setSelectedCard(cardId === selectedCard ? null : cardId);
  };

  const handlePlayCard = () => {
    if (selectedCard && onPlayCard) {
      onPlayCard(selectedCard);
      setSelectedCard(null);
    }
  };

  return (
    <div className="space-y-4" data-testid="player-hand">
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {cards.map((card) => (
          <PlayingCard
            key={card.id}
            color={card.color}
            value={card.value}
            type={card.type}
            isSelected={selectedCard === card.id}
            isPlayable={canPlay && card.isPlayable !== false}
            onClick={() => handleCardClick(card.id)}
          />
        ))}
      </div>
      {selectedCard && canPlay && (
        <div className="flex justify-center">
          <Button
            onClick={handlePlayCard}
            size="lg"
            data-testid="button-play-selected-card"
          >
            Play Card
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
