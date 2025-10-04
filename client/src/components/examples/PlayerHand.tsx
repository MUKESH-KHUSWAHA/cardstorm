import PlayerHand from '../PlayerHand';

export default function PlayerHandExample() {
  const cards = [
    { id: "1", color: "red" as const, value: 5, isPlayable: true },
    { id: "2", color: "blue" as const, value: 7, isPlayable: true },
    { id: "3", color: "green" as const, value: "Skip", type: "skip" as const, isPlayable: false },
    { id: "4", color: "yellow" as const, value: 3, isPlayable: true },
    { id: "5", color: "wild" as const, value: "Wild", type: "wild" as const, isPlayable: true },
    { id: "6", color: "red" as const, value: "+2", type: "draw2" as const, isPlayable: false },
    { id: "7", color: "blue" as const, value: 9, isPlayable: true },
  ];

  return (
    <PlayerHand
      cards={cards}
      onPlayCard={(cardId) => console.log('Playing card:', cardId)}
      canPlay={true}
    />
  );
}
