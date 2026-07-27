import type { default as AvailableSeat } from './availableSeat';
import type { default as BookedSeat } from './bookedSeat';
import type { default as SelectedSeat } from './selectedSeat';
import type { default as UnavailableSeat } from './unavailableSeat';

export type SeatType =
  | typeof AvailableSeat
  | typeof BookedSeat
  | typeof SelectedSeat
  | typeof UnavailableSeat;

export { default as AvailableSeat } from './availableSeat';
export { default as BookedSeat } from './bookedSeat';
export { default as SelectedSeat } from './selectedSeat';
export { default as UnavailableSeat } from './unavailableSeat';
