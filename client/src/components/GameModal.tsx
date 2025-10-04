import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, AlertCircle, BookOpen } from "lucide-react";

type ModalType = "win" | "lose" | "rules";

interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: ModalType;
  winner?: string;
  onPlayAgain?: () => void;
}

export default function GameModal({
  isOpen,
  onClose,
  type,
  winner,
  onPlayAgain,
}: GameModalProps) {
  const getContent = () => {
    switch (type) {
      case "win":
        return {
          icon: <Trophy className="h-16 w-16 text-chart-3" />,
          title: "🎉 Congratulations!",
          description: `${winner || "You"} won the game!`,
        };
      case "lose":
        return {
          icon: <AlertCircle className="h-16 w-16 text-destructive" />,
          title: "Game Over",
          description: `${winner} won this round. Better luck next time!`,
        };
      case "rules":
        return {
          icon: <BookOpen className="h-16 w-16 text-primary" />,
          title: "How to Play",
          description: "Match the card in the discard pile by color or number. Special cards include Skip, Reverse, Draw 2, and Wild cards. First player to empty their hand wins!",
        };
    }
  };

  const content = getContent();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid={`modal-${type}`}>
        <DialogHeader>
          <div className="flex justify-center mb-4">{content.icon}</div>
          <DialogTitle className="text-2xl text-center">{content.title}</DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            {content.description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:gap-2">
          {type !== "rules" && onPlayAgain && (
            <Button onClick={onPlayAgain} className="flex-1" data-testid="button-play-again">
              Play Again
            </Button>
          )}
          <Button
            onClick={onClose}
            variant={type === "rules" ? "default" : "outline"}
            className="flex-1"
            data-testid="button-close-modal"
          >
            {type === "rules" ? "Got it!" : "Close"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
