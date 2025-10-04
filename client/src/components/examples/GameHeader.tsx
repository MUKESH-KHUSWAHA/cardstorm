import GameHeader from '../GameHeader';

export default function GameHeaderExample() {
  return (
    <GameHeader
      currentRound={3}
      totalPlayers={4}
      onMenuClick={() => console.log('Menu clicked')}
      onLeaderboardClick={() => console.log('Leaderboard clicked')}
      onSettingsClick={() => console.log('Settings clicked')}
      onLogoutClick={() => console.log('Logout clicked')}
    />
  );
}
