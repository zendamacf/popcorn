import { Circle, Group } from 'konva';


class Seat {
  constructor(fillColor, opts) {
    const group = new Group({
      id: opts.id,
      x: opts.x,
      y: opts.y,
      name: opts.name,
    });

    const radius = opts.seatWidth / 2;

    const circle = new Circle({
      radius: radius,
      fill: fillColor,
    });
    group.add(circle);

    return group;
  }
}

export default Seat;