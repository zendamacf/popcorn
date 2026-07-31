import { Group } from 'konva/lib/Group';
import { Circle } from 'konva/lib/shapes/Circle';

export type SeatShapeOptions = {
  id?: string;
  x?: number;
  y?: number;
  name?: string;
  seatWidth: number;
  fillColor?: string;
};

class SeatShape {
  public shape: Group;

  public constructor(opts: SeatShapeOptions) {
    const shape = new Group({
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
    shape.add(circle);

    this.shape = shape;
  }
}

export default SeatShape;
