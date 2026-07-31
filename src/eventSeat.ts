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
      seatSvg: this.opts.seatSvg,
    });

    this.bindEvents();
  }

  private bindEvents(): void {
    const applyCursor = () => {
      const container = this.seatShape.shape.getStage()?.container();
      if (!container) return;
      container.style.cursor =
        this.booked || this.unavailable ? 'not-allowed' : 'pointer';
    };
    const clearCursor = () => {
      const container = this.seatShape.shape.getStage()?.container();
      if (!container) return;
      container.style.cursor = '';
    };

    // Konva 10 enables pointer events by default; listen for both mouse and
    // pointer enter/leave so cursor updates reliably across input types.
    this.seatShape.shape
      .on('mouseenter pointerenter', applyCursor)
      .on('mouseleave pointerleave', clearCursor)
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
    this.seatShape.body.fill(this.color());
    this.seatShape.shape.name(this.name());
  }
}

export default EventSeat;
