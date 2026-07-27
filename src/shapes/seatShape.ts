import { Group } from 'konva/lib/Group';
import { Circle } from 'konva/lib/shapes/Circle';

export type SeatShapeOptions = {
  id?: string;
  x: number;
  y: number;
  name: string;
  seatWidth: number;
  fillColor?: string;
};

class SeatShape {
  public group: Group;

  public constructor(opts: SeatShapeOptions) {
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
      fill: opts.fillColor,
    });
    group.add(circle);

    this.group = group;
  }
}

export default SeatShape;
