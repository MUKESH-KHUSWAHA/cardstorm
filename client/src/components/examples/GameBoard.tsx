import GameBoard from '../GameBoard';

export default function GameBoardExample() {
  return (
    <GameBoard
      topCard={{ color: "red", value: 7 }}
      onDrawCard={() => console.log('Draw card clicked')}
      deckCount={42}
    />
  );
}
