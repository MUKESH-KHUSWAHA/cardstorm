import GameLobby from '../GameLobby';
import avatar1 from '@assets/stock_images/gaming_avatar_profil_a0ad907c.jpg';
import avatar2 from '@assets/stock_images/gaming_avatar_profil_ecf2f00f.jpg';

export default function GameLobbyExample() {
  const players = [
    { id: "1", username: "HostPlayer", avatar: avatar1, isReady: true },
    { id: "2", username: "Player2", avatar: avatar2, isReady: true },
  ];

  return (
    <GameLobby
      players={players}
      isHost={true}
      onToggleReady={() => console.log('Toggle ready')}
      onStartGame={() => console.log('Start game')}
      isSearching={true}
    />
  );
}
