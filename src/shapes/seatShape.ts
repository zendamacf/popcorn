import { Group } from 'konva/lib/Group';
import { Circle } from 'konva/lib/shapes/Circle';
import { Line } from 'konva/lib/shapes/Line';

export type SeatShapeOptions = {
  id?: string;
  x?: number;
  y?: number;
  name?: string;
  seatWidth: number;
  fillColor?: string;
  unavailable?: boolean;
  unavailableColor?: string;
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
      opacity: opts.unavailable ? 0.4 : 1,
    });
    shape.add(circle);

    if (opts.unavailable) {
      const lineEnd = radius / 2;
      const line1 = new Line({
        points: [-lineEnd, -lineEnd, 0, 0, lineEnd, lineEnd],
        stroke: opts.unavailableColor,
      });
      const line2 = new Line({
        points: [-lineEnd, lineEnd, 0, 0, lineEnd, -lineEnd],
        stroke: opts.unavailableColor,
      });
      shape.add(line1).add(line2);
    }

    this.shape = shape;
  }
}

export default SeatShape;
