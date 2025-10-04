import Leaderboard from '../Leaderboard';
import avatar1 from '@assets/stock_images/gaming_avatar_profil_a0ad907c.jpg';
import avatar2 from '@assets/stock_images/gaming_avatar_profil_ecf2f00f.jpg';
import avatar3 from '@assets/stock_images/gaming_avatar_profil_2cc9d0cc.jpg';

export default function LeaderboardExample() {
  const entries = [
    { rank: 1, username: "CardMaster", avatar: avatar1, wins: 47, gamesPlayed: 52 },
    { rank: 2, username: "QuickDraw", avatar: avatar2, wins: 38, gamesPlayed: 45 },
    { rank: 3, username: "WildCard", avatar: avatar3, wins: 35, gamesPlayed: 50 },
    { rank: 4, username: "Player123", wins: 28, gamesPlayed: 40 },
    { rank: 5, username: "Challenger", wins: 22, gamesPlayed: 35 },
  ];

  return <Leaderboard entries={entries} />;
}
