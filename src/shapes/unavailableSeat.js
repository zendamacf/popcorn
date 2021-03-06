import { Line } from 'konva/lib/shapes/Line';
import Seat from './seat';


class UnavailableSeat {
  constructor(opts) {
    const group = new Seat(opts.seatColor, opts);
    group.find('Circle').opacity(0.4);

    const radius = opts.seatWidth / 2;

    const lineEnd = radius / 2;
    const line1 = new Line({
      points: [-lineEnd, -lineEnd, 0, 0, lineEnd, lineEnd],
      stroke: 'black',
    });
    const line2 = new Line({
      points: [-lineEnd, lineEnd, 0, 0, lineEnd, -lineEnd],
      stroke: 'black',
    });
    group
      .add(line1)
      .add(line2);

    return group;
  }
}

export default UnavailableSeat;