import { Stage, Layer, Text as KText } from 'konva';
import Seat from './seat';
import { DEFAULTS } from './defaults';

/**
 * Get spreadsheet-style row label, e.g. A-Z, then AA, AB, etc.
 * @param {number} rowNumber 
 */
function rowLabel(rowNumber) {
  let temp, letter = '';
  while (rowNumber > 0) {
    // 65 - 90 is A - Z
    temp = (rowNumber - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    rowNumber = (rowNumber - temp - 1) / 26;
  }
  return letter;
}


class Popcorn {
  constructor(opts) {
    opts = Object.assign(DEFAULTS, opts || {});

    this.stage = new Stage({
      container: opts.elem,
      width: opts.width,
      height: opts.height,
    });

    const layer = new Layer();

    let count = 0;
    let rowCount = 1;
    let xOffset = opts.rowLabelWidth + opts.seatWidth / 2;
    let yOffset = opts.seatWidth / 2;
    for (const s of opts.seatList) {
      const seat = new Seat(
        Object.assign(
          {
            id: s.id,
            x: xOffset,
            y: yOffset,
            available: s.available,
            booked: s.booked,
          },
          opts
        )
      ).shape;

      seat.on('click tap', (e) => {
        const shape = e.target;
        const seat = shape.getAttr('seat');
        const seats = this.stage.find('.selected');
        if (seat.booked || !seat.available) return;

        if (!seat.isSelected && seats.length >= opts.maxSeats) {
          alert(`You already have ${opts.maxSeats} seats selected.`);
          return;
        }

        if (seat.isSelected) seat.deselect();
        else seat.select();
        this.redraw();
      });

      count++;
      if ((count) % opts.rowWidth === 0) {
        const label = new KText({
          x: 0,
          y: yOffset - opts.seatMargin / 2,
          fontSize: opts.seatWidth * 0.6,
          fontStyle: 'bold',
          verticalAlign: 'middle',
          text: rowLabel(rowCount),
        });
        layer.add(label);

        // End of row, go to next one
        xOffset = opts.rowLabelWidth + opts.seatWidth / 2;
        yOffset += opts.seatWidth + opts.seatMargin;

        rowCount++;
      } else {
        xOffset += opts.seatWidth + opts.seatMargin;
      }

      layer.add(seat);
    }

    this.stage.add(layer);
    layer.draw();
  }

  redraw() {
    this.stage.draw();
  }

  /**
   * Get the selected seats.
   */
  get selected() {
    const seats = this.stage.find('.selected');
    const selected = seats.map(seat => seat.id());
    return selected;
  }

  /**
   * Set the selected seats.
   */
  set selected(seats) {
    this.stage.find('.selected').each((shape) => {
      const seat = shape.getAttr('seat');

      seat.deselect();
    });

    seats.forEach(id => {
      const shape = this.stage.find(`#${id}`)[0];
      const seat = shape.getAttr('seat');

      seat.select();
    });

    this.redraw();
  }
}

// Assign to window for use in standard browser
window.Popcorn = Popcorn;