type PopcornDefaults = {
  /** Color for all text */
  textColor: string;
  /** Fill color for seats */
  seatColor: string;
  /** Fill color for booked seats */
  bookedColor: string;
  /** Fill color for selected seats */
  selectedColor: string;
  /** Stroke color for the X on unavailable seats */
  unavailableColor: string;
  /** Width of the seat shape in pixels */
  seatWidth: number;
  /** Margin between seat shapes in pixels */
  seatMargin: number;
  /** Width of row label in pixels */
  rowLabelWidth: number;
};

type SeatListItem = {
  id?: string;
  booked?: boolean;
  unavailable?: boolean;
};

type PopcornOptions = PopcornDefaults & {
  elem: string;
  width: number;
  height: number;
  rowWidth: number;
  maxSeats: number;
  seatList: SeatListItem[];
  backgroundColor?: string;
};

/** Constructor input; defaults are filled in from DEFAULTS. */
type PopcornInitOptions = Partial<PopcornDefaults> &
  Omit<PopcornOptions, keyof PopcornDefaults> & {
    backgroundColor?: string;
  };

type PopcornEvent =
  | 'popcorn.selectseat'
  | 'popcorn.deselectseat'
  | 'popcorn.maxseats';

interface Window {
  Popcorn: new (
    options: PopcornInitOptions,
  ) => {
    on(eventName: string, eventHandler: (event: Event) => void): void;
    redraw(): void;
    destroy(): void;
    selected: string[];
  };
}
