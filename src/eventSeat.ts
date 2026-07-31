import type { KonvaEventObject } from 'konva/lib/Node';
import type { Circle } from 'konva/lib/shapes/Circle';
import SeatShape from './shapes/seatShape';

class EventSeat {
  private id?: string;
  private x: number;
  private y: number;
  private booked: boolean;
  private unavailable: boolean;
  private isSelected: boolean;
  public seatShape: SeatShape;
  private opts: PopcornOptions;

  constructor({
    id,
    x,
    y,
    booked,
    unavailable,
    ...opts
  }: SeatListItem & PopcornOptions & { x: number; y: number }) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.booked = booked || false;
    this.unavailable = unavailable || false;
    this.isSelected = false;
    this.opts = opts;

    this.seatShape = new SeatShape({
      id: this.id,
      x: this.x,
      y: this.y,
      name: this.name(),
      seatWidth: this.opts.seatWidth,
      fillColor: this.color(),
      unavailable: this.unavailable,
      unavailableColor: this.opts.unavailableColor,
    });

    this.bindEvents();
  }

  private bindEvents(): void {
    this.seatShape.shape
      .on('mouseenter', (e: KonvaEventObject<MouseEvent>) => {
        const container = e.target?.getStage()?.container();
        if (!container) return;
        if (this.booked || this.unavailable)
          container.style.cursor = 'not-allowed';
        else container.style.cursor = 'pointer';
      })
      .on('mouseleave', (e: KonvaEventObject<MouseEvent>) => {
        const container = e.target.getStage()?.container();
        if (!container) return;
        container.style.cursor = '';
      })
      .setAttr('seat', this);
  }

  /**
   * The color to fill this seat with.
   */
  public color(): string {
    if (this.isSelected) return this.opts.selectedColor;
    if (this.booked) return this.opts.bookedColor;
    return this.opts.seatColor;
  }

  /**
   * The name for this seat, used for finding selected seats from
   * the Konva Stage object.
   */
  public name(): string {
    if (this.isSelected) return 'selected';
    return 'unselected';
  }

  /**
   * Select this seat.
   */
  public select(): void {
    if (this.booked || this.unavailable) return;

    this.isSelected = true;
    this.change();
  }

  /**
   * Deselect this seat.
   */
  public deselect(): void {
    this.isSelected = false;
    this.change();
  }

  public change(): void {
    const circle = this.seatShape.shape.findOne('Circle') as Circle;
    circle.fill(this.color());
    this.seatShape.shape.name(this.name());
  }

  /**
   * Get the Konva shape object representing this seat.
   */
  public get shape(): SeatShape {
    return this.seatShape;
  }
}

export default EventSeat;
