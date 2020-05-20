import { Layer, Text as KText } from 'konva';
import AvailableSeat from './shapes/availableSeat';
import UnavailableSeat from './shapes/unavailableSeat';
import BookedSeat from './shapes/bookedSeat';
import SelectedSeat from './shapes/selectedSeat';


class Legend {
  constructor(opts) {
    this.opts = opts;
    this.seatWidth = this.opts.seatWidth + this.opts.seatMargin;
    this.xOffset = 20;
    this.yOffset = 20;
    this.layer = new Layer();

    this._populateAvailable();
    this._populateUnavailable();
    this._populateBooked();
    this._populateSelected();

    return this.layer;
  }

  _populateAvailable() {
    const seat = new AvailableSeat(
      Object.assign(
        {
          x: this.xOffset,
          y: this.yOffset,
        },
        this.opts
      )
    );

    const label = new KText({
      x: this.seatWidth,
      y: this.yOffset,
      fill: this.opts.textColor,
      text: 'Available',
    });

    this.layer
      .add(seat)
      .add(label);
  }

  _populateUnavailable() {
    const seat = new UnavailableSeat(
      Object.assign(
        {
          x: this.xOffset,
          y: this.yOffset + this.seatWidth,
        },
        this.opts
      )
    );

    const label = new KText({
      x: this.seatWidth,
      y: this.yOffset + this.seatWidth,
      fill: this.opts.textColor,
      text: 'Unavailable',
    });

    this.layer
      .add(seat)
      .add(label);
  }

  _populateBooked() {
    const seat = new BookedSeat(
      Object.assign(
        {
          x: this.xOffset,
          y: this.yOffset + this.seatWidth * 2,
        },
        this.opts
      )
    );

    const label = new KText({
      x: this.seatWidth,
      y: this.yOffset + this.seatWidth * 2,
      fill: this.opts.textColor,
      text: 'Booked',
    });

    this.layer
      .add(seat)
      .add(label);
  }

  _populateSelected() {
    const seat = new SelectedSeat(
      Object.assign(
        {
          x: this.xOffset,
          y: this.yOffset + this.seatWidth * 3,
        },
        this.opts
      )
    );

    const label = new KText({
      x: this.seatWidth,
      y: this.yOffset + this.seatWidth * 3,
      fill: this.opts.textColor,
      text: 'Selected',
    });

    this.layer
      .add(seat)
      .add(label);
  }
}

export default Legend;