import { Group } from 'konva/lib/Group';
import { Text as KText } from 'konva/lib/shapes/Text';
import AvailableSeat from './shapes/availableSeat';
import UnavailableSeat from './shapes/unavailableSeat';
import BookedSeat from './shapes/bookedSeat';
import SelectedSeat from './shapes/selectedSeat';


class Legend {
  constructor(maxWidth, opts) {
    this.opts = opts;
    // The default text size is 12, so offset by 6 to align
    // with center of circles
    this.halfText = 6;
    this.width = maxWidth;
    // Spread out entries across the legend
    this.entryWidth = this.width / 4;
    this.entryPadding = this.entryWidth / 4;
    this.seatWidth = this.opts.seatWidth / 2 + this.opts.seatMargin;

    this.group = new Group({
      x: 20,
      y: this.opts.height - 40,
      width: this.width,
    });

    this._populateAvailable();
    this._populateUnavailable();
    this._populateBooked();
    this._populateSelected();

    return this.group;
  }

  _populateAvailable() {
    this._populateEntry(AvailableSeat, 'Available', 0);
  }

  _populateUnavailable() {
    this._populateEntry(UnavailableSeat, 'Unavailable', 1);
  }

  _populateBooked() {
    this._populateEntry(BookedSeat, 'Booked', 2);
  }

  _populateSelected() {
    this._populateEntry(SelectedSeat, 'Selected', 3);
  }

  _populateEntry(entryClass, labelText, index) {
    // Figure out starting x for this entry
    const xStart = this.entryWidth * index;

    const seat = new entryClass(
      Object.assign(
        {x: xStart + this.entryPadding},
        this.opts
      )
    );
    
    const label = new KText({
      x: xStart + this.seatWidth + this.entryPadding,
      y: -this.halfText,
      fill: this.opts.textColor,
      text: labelText,
    });
    
    this.group
      .add(seat)
      .add(label);
  }
}

export default Legend;