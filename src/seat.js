import { Circle } from 'konva';


class Seat {
  constructor(opts) {
    this.id = opts.id;
    this.x = opts.x;
    this.y = opts.y;
    this.booked = opts.booked;
    this.available = opts.available;
    this.isSelected = false;
    this.opts = opts;

    this.seatShape = new Circle({
      id: this.id,
      x: this.x,
      y: this.y,
      name: this.name(),
      radius: opts.seatWidth / 2,
      fill: this.color(),
    });
    this.seatShape
      .on('mouseenter', (e) => {
        const container = e.target.getStage().container();
        if (this.booked || !this.available) container.style.cursor = 'not-allowed';
        else container.style.cursor = 'pointer';
      })
      .on('mouseleave', (e) => {
        const container = e.target.getStage().container();
        container.style.cursor = '';
      })
      .setAttr('seat', this);
  }

  /**
   * The color to fill this seat with.
   */
  color() {
    if (this.isSelected) return this.opts.selectedColor;
    if (this.booked) return this.opts.bookedColor;
    if (!this.available) return this.opts.unavailableColor;
    return this.opts.availableColor;
  }

  /**
   * The name for this seat, used for finding selected seats from
   * the Konva Stage object.
   */
  name() {
    if (this.isSelected) return 'selected';
    return 'unselected';
  }

  /**
   * Select this seat.
   */
  select() {
    if (this.booked || !this.available) return;

    this.isSelected = true;
    this.change();
  }

  /**
   * Deselect this seat.
   */
  deselect() {
    this.isSelected = false;
    this.change();
  }

  change() {
    this.seatShape.fill(this.color());
    this.seatShape.name(this.name());
  }

  /**
   * Get the Konva shape object representing this seat.
   */
  get shape() {
    return this.seatShape;
  }
}

export default Seat;