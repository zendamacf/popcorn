import { Circle } from 'konva/lib/shapes/Circle';
import { Group } from 'konva/lib/Group';


class Seat {
  constructor(fillColor, opts) {
    const group = new Group({
      id: opts.id,
      x: opts.x,
      y: opts.y,
      name: opts.name,
      preventDefault: false,
    });

    const radius = opts.seatWidth / 2;

    // Don't preventDefault here, as we actually need events on this
    const circle = new Circle({
      radius: radius,
      fill: fillColor,
    });
    group.add(circle);

    return group;
  }
}

export default Seat;