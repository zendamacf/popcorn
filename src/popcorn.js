import { Stage, Layer, Text as KText } from 'konva';
import Seat from './seat';
import { SEAT_WIDTH, SEAT_MARGIN } from './layout';

class Popcorn {
  constructor(opts) {
    this.stage = new Stage({
      container: opts.elem,
      width: opts.width,
      height: opts.height,
    });

    const layer = new Layer();

    let count = 0;
    let xOffset = SEAT_WIDTH / 2;
    let yOffset = SEAT_WIDTH / 2;
    for (const s of opts.seatList) {
      const seat = new Seat(
        s.id,
        xOffset,
        yOffset,
        s.available,
      ).shape;

      seat.on('click tap', (e) => {
        const shape = e.target;
        const seat = shape.getAttr('seat');
        if (!seat.available) return;
        const seats = this.stage.find('.selected');

        if (!seat.selected && seats.length >= opts.maxSeats) {
          alert(`You already have ${opts.maxSeats} seats selected.`);
          return;
        }

        seat.selected = !seat.selected;
        shape.fill(seat.color());
        shape.name(seat.name());
        this.stage.draw();
      });

      layer.add(seat);

      count++;
      if ((count) % opts.rowWidth === 0) {
        xOffset = SEAT_WIDTH / 2;
        yOffset += SEAT_WIDTH + SEAT_MARGIN;
      } else {
        xOffset += SEAT_WIDTH + SEAT_MARGIN;
      }
    }

    this.stage.add(layer);
    layer.draw();
  }

  redraw() {
    this.stage.draw();
  }

  get selected() {
    const seats = this.stage.find('.selected');
    const selected = seats.map(seat => seat.id());
    return selected;
  }
}

window.Popcorn = Popcorn;