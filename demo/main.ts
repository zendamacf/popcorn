import Popcorn from '../src/popcorn';

const seats: SeatListItem[] = [
  { id: 'A1', booked: true },
  { id: 'A2', unavailable: true },
  { id: 'A3', booked: true },
  { id: 'A4' },
  { id: 'A5' },
  {},
  {},
  { id: 'A6' },
  { id: 'A7' },
  { id: 'A8' },
  { id: 'A9' },
  { id: 'A10' },
  { id: 'B1' },
  { id: 'B2', booked: true },
  { id: 'B3' },
  { id: 'B4', booked: true },
  { id: 'B5' },
  {},
  {},
  { id: 'B6', booked: true },
  { id: 'B7', booked: true },
  { id: 'B8' },
  { id: 'B9' },
  { id: 'B10' },
  { id: 'C1', booked: true },
  { id: 'C2', booked: true },
  { id: 'C3' },
  { id: 'C4' },
  { id: 'C5' },
  {},
  {},
  { id: 'C6' },
  { id: 'C7' },
  { id: 'C8' },
  { id: 'C9' },
  { id: 'C10' },
  { id: 'D1' },
  { id: 'D2' },
  { id: 'D3' },
  { id: 'D4' },
  { id: 'D5' },
  {},
  {},
  { id: 'D6', booked: true },
  { id: 'D7', unavailable: true },
  { id: 'D8', booked: true },
  { id: 'D9', unavailable: true, booked: true },
  { id: 'D10', booked: true },
  { id: 'E1' },
  { id: 'E2', unavailable: true },
  { id: 'E3' },
  { id: 'E4' },
  { id: 'E5', booked: true },
  {},
  {},
  { id: 'E6' },
  { id: 'E7' },
  { id: 'E8' },
  { id: 'E9' },
  { id: 'E10' },
  { id: 'F1' },
  { id: 'F2' },
  { id: 'F3' },
  { id: 'F4', booked: true },
  { id: 'F5', booked: true },
  {},
  {},
  { id: 'F6' },
  { id: 'F7' },
  { id: 'F8' },
  { id: 'F9', booked: true },
  { id: 'F10', booked: true },
];

const popcorn = new Popcorn({
  elem: '#seats',
  width: 1000,
  height: 500,
  rowWidth: 12,
  maxSeats: 3,
  backgroundColor: '#202020',
  bookedColor: '#BD1522',
  selectedColor: '#009D3C',
  textColor: 'white',
  seatList: seats,
});

function randomAvailableSeat() {
  const available = seats.filter((seat) => !seat.unavailable && seat.id);
  const index = Math.floor(Math.random() * available.length);
  return available[index];
}

document.getElementById('get-seats')?.addEventListener('click', () => {
  alert(popcorn.selected);
});

document.getElementById('set-seats')?.addEventListener('click', () => {
  const selected: string[] = [];
  while (selected.length < 3) {
    const id = randomAvailableSeat().id;
    if (id && !selected.includes(id)) selected.push(id);
  }
  popcorn.selected = selected;
});

document.getElementById('refresh')?.addEventListener('click', () => {
  popcorn.redraw();
});

document.getElementById('remove')?.addEventListener('click', () => {
  popcorn.destroy();
});

popcorn.on('popcorn.selectseat', (e: Event) => {
  console.log('SELECTING SEAT', (e as CustomEvent).detail);
});
popcorn.on('popcorn.deselectseat', (e: Event) => {
  console.log('DESELECTING SEAT', (e as CustomEvent).detail);
});
popcorn.on('popcorn.maxseats', (e: Event) => {
  console.log('MAX LIMIT', (e as CustomEvent).detail);
});
