import { useState } from "react";
import GameHeader from "@/components/GameHeader";
import GameBoard from "@/components/GameBoard";
import PlayerHand from "@/components/PlayerHand";
import PlayerArea from "@/components/PlayerArea";
import Leaderboard from "@/components/Leaderboard";
import GameModal from "@/components/GameModal";
import avatar1 from "@assets/stock_images/gaming_avatar_profil_a0ad907c.jpg";
import avatar2 from "@assets/stock_images/gaming_avatar_profil_ecf2f00f.jpg";
import avatar3 from "@assets/stock_images/gaming_avatar_profil_2cc9d0cc.jpg";
import avatar4 from "@assets/stock_images/gaming_avatar_profil_a51c4443.jpg";

export default function Home() {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const myCards = [
    { id: "1", color: "red" as const, value: 5, isPlayable: true },
    { id: "2", color: "blue" as const, value: 7, isPlayable: true },
    { id: "3", color: "green" as const, value: "Skip", type: "skip" as const, isPlayable: false },
    { id: "4", color: "yellow" as const, value: 3, isPlayable: true },
    { id: "5", color: "wild" as const, value: "Wild", type: "wild" as const, isPlayable: true },
    { id: "6", color: "red" as const, value: "+2", type: "draw2" as const, isPlayable: false },
    { id: "7", color: "blue" as const, value: 9, isPlayable: true },
  ];

  const leaderboardData = [
    { rank: 1, username: "CardMaster", avatar: avatar1, wins: 47, gamesPlayed: 52 },
    { rank: 2, username: "QuickDraw", avatar: avatar2, wins: 38, gamesPlayed: 45 },
    { rank: 3, username: "WildCard", avatar: avatar3, wins: 35, gamesPlayed: 50 },
    { rank: 4, username: "Player123", avatar: avatar4, wins: 28, gamesPlayed: 40 },
    { rank: 5, username: "Challenger", wins: 22, gamesPlayed: 35 },
  ];

  return (
    <div className="flex flex-col h-screen">
      <GameHeader
        currentRound={3}
        totalPlayers={4}
        onMenuClick={() => console.log('Menu clicked')}
        onLeaderboardClick={() => setShowLeaderboard(true)}
        onSettingsClick={() => setShowRules(true)}
        onLogoutClick={() => console.log('Logout clicked')}
      />

      <main className="flex-1 overflow-hidden flex">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-6xl space-y-8">
              <div className="flex justify-center">
                <PlayerArea
                  username="Opponent1"
                  avatar={avatar2}
                  cardCount={4}
                  position="top"
                />
              </div>

              <div className="flex items-center justify-between px-12">
                <PlayerArea
                  username="Opponent2"
                  avatar={avatar3}
                  cardCount={5}
                  position="left"
                />

                <GameBoard
                  topCard={{ color: "red", value: 7 }}
                  onDrawCard={() => console.log('Draw card')}
                  deckCount={42}
                />

                <PlayerArea
                  username="Opponent3"
                  avatar={avatar4}
                  cardCount={3}
                  position="right"
                />
              </div>

              <div className="flex justify-center">
                <PlayerArea
                  username="You"
                  avatar={avatar1}
                  cardCount={myCards.length}
                  isCurrentTurn={true}
                  position="bottom"
                />
              </div>
            </div>
          </div>

          <div className="border-t bg-card/50 p-6">
            <PlayerHand
              cards={myCards}
              onPlayCard={(cardId) => console.log('Playing card:', cardId)}
              canPlay={true}
            />
          </div>
        </div>

        {showLeaderboard && (
          <div className="w-96 border-l p-6 overflow-y-auto">
            <Leaderboard entries={leaderboardData} />
          </div>
        )}
      </main>

      <GameModal
        isOpen={showRules}
        onClose={() => setShowRules(false)}
        type="rules"
      />
    </div>
  );
}
