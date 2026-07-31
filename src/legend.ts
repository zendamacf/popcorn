import { Group } from 'konva/lib/Group';
import { Text as KText } from 'konva/lib/shapes/Text';
import SeatShape from './shapes/seatShape';

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

    this.populateEntry('Available', this.opts.seatColor, 0);
    this.populateEntry('Unavailable', this.opts.seatColor, 1, true);
    this.populateEntry('Booked', this.opts.bookedColor, 2);
    this.populateEntry('Selected', this.opts.selectedColor, 3);
  }

  private populateEntry(
    labelText: string,
    fillColor: string,
    index: number,
    unavailable = false,
  ): void {
    const xStart = this.entryWidth * index;

    const seat = new SeatShape({
      x: xStart + this.entryPadding,
      seatWidth: this.opts.seatWidth,
      fillColor,
      unavailable,
      unavailableColor: this.opts.unavailableColor,
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
