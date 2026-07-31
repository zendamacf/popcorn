import { Group } from 'konva/lib/Group';
import type { Shape } from 'konva/lib/Shape';
import { Circle } from 'konva/lib/shapes/Circle';
import { Line } from 'konva/lib/shapes/Line';
import { Path } from 'konva/lib/shapes/Path';

export type SeatShapeOptions = {
  id?: string;
  x?: number;
  y?: number;
  name?: string;
  seatWidth: number;
  fillColor?: string;
  unavailable?: boolean;
  unavailableColor?: string;
  /** SVG path `d` data. When omitted, seats are drawn as circles. */
  seatSvg?: string;
};

const SEAT_BODY_NAME = 'seat-body';

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
    const opacity = opts.unavailable ? 0.4 : 1;

    shape.add(
      opts.seatSvg
        ? this.buildSvgSeat(
            opts.seatSvg,
            opts.seatWidth,
            opts.fillColor,
            opacity,
          )
        : this.buildCircleSeat(radius, opts.fillColor, opacity),
    );

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

  private buildCircleSeat(
    radius: number,
    fillColor: string | undefined,
    opacity: number,
  ): Circle {
    // Don't preventDefault here, as we actually need events on this
    return new Circle({
      name: SEAT_BODY_NAME,
      radius,
      fill: fillColor,
      opacity,
    });
  }

  private buildSvgSeat(
    data: string,
    seatWidth: number,
    fillColor: string | undefined,
    opacity: number,
  ): Path {
    const path = new Path({
      name: SEAT_BODY_NAME,
      data,
      fill: fillColor,
      opacity,
    });

    const bounds = path.getSelfRect();
    const size = Math.max(bounds.width, bounds.height) || 1;
    const scale = seatWidth / size;
    path.scaleX(scale);
    path.scaleY(scale);
    path.offsetX(bounds.x + bounds.width / 2);
    path.offsetY(bounds.y + bounds.height / 2);

    return path;
  }

  /** The fillable seat body (circle or SVG path). */
  public get body(): Shape {
    return this.shape.findOne(`.${SEAT_BODY_NAME}`) as Shape;
  }
}

export default SeatShape;
export { SEAT_BODY_NAME };
