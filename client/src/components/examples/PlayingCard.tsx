import PlayingCard from '../PlayingCard';

export default function PlayingCardExample() {
  return (
    <div className="flex gap-4 flex-wrap">
      <PlayingCard color="red" value={7} />
      <PlayingCard color="blue" value="Skip" type="skip" />
      <PlayingCard color="green" value="Reverse" type="reverse" />
      <PlayingCard color="yellow" value="+2" type="draw2" />
      <PlayingCard color="wild" value="Wild" type="wild" />
      <PlayingCard color="red" value={5} isFaceDown />
      <PlayingCard color="blue" value={3} isSelected />
    </div>
  );
}
