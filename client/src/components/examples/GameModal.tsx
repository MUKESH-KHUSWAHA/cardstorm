import { useState } from 'react';
import GameModal from '../GameModal';
import { Button } from '@/components/ui/button';

export default function GameModalExample() {
  const [modalType, setModalType] = useState<'win' | 'lose' | 'rules' | null>(null);

  return (
    <div className="flex gap-4">
      <Button onClick={() => setModalType('win')} data-testid="button-show-win">
        Show Win Modal
      </Button>
      <Button onClick={() => setModalType('lose')} variant="destructive">
        Show Lose Modal
      </Button>
      <Button onClick={() => setModalType('rules')} variant="outline">
        Show Rules
      </Button>
      
      {modalType && (
        <GameModal
          isOpen={true}
          onClose={() => setModalType(null)}
          type={modalType}
          winner="CardMaster"
          onPlayAgain={() => {
            console.log('Play again clicked');
            setModalType(null);
          }}
        />
      )}
    </div>
  );
}
