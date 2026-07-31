import { Group } from 'konva/lib/Group';
import { Text as KText } from 'konva/lib/shapes/Text';
import {
  AvailableSeat,
  BookedSeat,
  type SeatType,
  SelectedSeat,
  UnavailableSeat,
} from './shapes';

class Legend {
  public shape: Group;
  private opts: PopcornOptions;
  private halfText: number;
  private width: number;
  private entryWidth: number;
  private entryPadding: number;
  private seatWidth: number;

  constructor(maxWidth: number, opts: PopcornOptions) {
    this.opts = opts;
    // The default text size is 12, so offset by 6 to aligns
    // with center of circles
    this.halfText = 6;
    this.width = maxWidth;
    // Spread out entries across the legend
    this.entryWidth = this.width / 4;
    this.entryPadding = this.entryWidth / 4;
    this.seatWidth = this.opts.seatWidth / 2 + this.opts.seatMargin;

    this.shape = new Group({
      x: 20,
      y: this.opts.height - 40,
      width: this.width,
      preventDefault: false,
    });

    this.populateAvailable();
    this.populateUnavailable();
    this.populateBooked();
    this.populateSelected();
  }

  private populateAvailable(): void {
    this.populateEntry(AvailableSeat, 'Available', 0);
  }

  private populateUnavailable(): void {
    this.populateEntry(UnavailableSeat, 'Unavailable', 1);
  }

  private populateBooked(): void {
    this.populateEntry(BookedSeat, 'Booked', 2);
  }

  private populateSelected(): void {
    this.populateEntry(SelectedSeat, 'Selected', 3);
  }

  private populateEntry<T extends SeatType>(
    entryClass: T,
    labelText: string,
    index: number,
  ): void {
    // Figure out starting x for this entry
    const xStart = this.entryWidth * index;

    const seat = new entryClass({
      x: xStart + this.entryPadding,
      ...this.opts,
    });

    const label = new KText({
      x: xStart + this.seatWidth + this.entryPadding,
      y: -this.halfText,
      fill: this.opts.textColor,
      text: labelText,
      preventDefault: false,
    });

    this.shape.add(seat.shape).add(label);
  }
}

export default Legend;
