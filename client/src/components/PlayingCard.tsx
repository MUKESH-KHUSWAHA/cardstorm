import { cn } from "@/lib/utils";
import cardBackImage from "@assets/stock_images/colorful_abstract_ge_e4d9dab3.jpg";

type CardColor = "red" | "blue" | "green" | "yellow" | "wild";
type CardType = "number" | "skip" | "reverse" | "draw2" | "wild" | "wild-draw4";

interface PlayingCardProps {
  color: CardColor;
  value: string | number;
  type?: CardType;
  isFaceDown?: boolean;
  isSelected?: boolean;
  isPlayable?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function PlayingCard({
  color,
  value,
  type = "number",
  isFaceDown = false,
  isSelected = false,
  isPlayable = true,
  onClick,
  className,
}: PlayingCardProps) {
  const colorClasses = {
    red: "bg-game-red",
    blue: "bg-game-blue",
    green: "bg-game-green",
    yellow: "bg-game-yellow",
    wild: "bg-game-wild",
  };

  return (
    <div
      onClick={isPlayable && !isFaceDown ? onClick : undefined}
      data-testid={`card-${isFaceDown ? 'back' : `${color}-${value}`}`}
      className={cn(
        "relative aspect-[5/7] w-24 rounded-xl border-2 transition-all duration-200",
        isFaceDown
          ? "bg-card border-card-border cursor-default"
          : `${colorClasses[color]} border-white/30`,
        isPlayable && !isFaceDown && "cursor-pointer hover:-translate-y-2 hover:shadow-xl",
        isSelected && "ring-4 ring-primary scale-105 -translate-y-2",
        !isPlayable && !isFaceDown && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {isFaceDown ? (
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <img
            src={cardBackImage}
            alt="Card back"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {type === "wild" || type === "wild-draw4" ? (
              <div className="space-y-1">
                <div className="text-4xl font-bold text-white drop-shadow-lg">
                  {type === "wild-draw4" ? "+4" : "W"}
                </div>
              </div>
            ) : type === "skip" ? (
              <div className="text-5xl font-bold text-white drop-shadow-lg">⊘</div>
            ) : type === "reverse" ? (
              <div className="text-5xl font-bold text-white drop-shadow-lg">⇄</div>
            ) : type === "draw2" ? (
              <div className="text-4xl font-bold text-white drop-shadow-lg">+2</div>
            ) : (
              <div className="text-6xl font-bold text-white drop-shadow-lg">
                {value}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
