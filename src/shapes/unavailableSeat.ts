import { Line } from 'konva/lib/shapes/Line';
import SeatShape, { type SeatShapeOptions } from './seatShape';

class UnavailableSeat extends SeatShape {
  constructor(opts: SeatShapeOptions) {
    super(opts);

    this.shape.find('Circle')[0].opacity(0.4);

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
    this.shape.add(line1).add(line2);
  }
}

export default UnavailableSeat;
