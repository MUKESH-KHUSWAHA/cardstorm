import PlayerArea from '../PlayerArea';
import avatar1 from '@assets/stock_images/gaming_avatar_profil_a0ad907c.jpg';

export default function PlayerAreaExample() {
  return (
    <div className="space-y-4 max-w-xs">
      <PlayerArea
        username="Player1"
        avatar={avatar1}
        cardCount={5}
        isCurrentTurn={true}
      />
      <PlayerArea
        username="Challenger"
        cardCount={3}
        isOnline={false}
      />
    </div>
  );
}
