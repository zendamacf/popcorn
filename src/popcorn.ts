// Ensures DragAndDrop (Konva.DD) is registered when using modular imports.
import 'konva/lib/Core';
import { Layer } from 'konva/lib/Layer';
import { Stage } from 'konva/lib/Stage';
import { Rect } from 'konva/lib/shapes/Rect';
import { Text as KText } from 'konva/lib/shapes/Text';
import { DEFAULTS } from './defaults';
import EventSeat from './eventSeat';
import Legend from './legend';
import type SeatShape from './shapes/seatShape';
import { centerKonvaNode, cloneArray, multiArray, rowLabel } from './utils';

class Popcorn {
  private opts: PopcornOptions;
  private elem: HTMLDivElement;
  private layout: SeatListItem[];
  private stage: Stage;
  private seatWidth: number;
  private centeringOffset: number;

  constructor(options: PopcornInitOptions) {
    this.opts = { ...DEFAULTS, ...options };
    if (!this.opts.seatList) throw 'No seatlist provided.';

    const elem = document.querySelector<HTMLDivElement>(this.opts.elem);
    if (elem === null) throw 'Element not found.';
    this.elem = elem;

    this.layout = cloneArray(this.opts.seatList);

    this.stage = new Stage({
      container: this.elem,
      width: this.opts.width,
      height: this.opts.height,
      preventDefault: false,
    });

    this.seatWidth = this.opts.seatWidth + this.opts.seatMargin;
    // Center the seats in the middle of the canvas
    const layoutWidth =
      Math.min(this.layout.length, this.opts.rowWidth) * this.seatWidth +
      this.opts.rowLabelWidth;
    this.centeringOffset = (this.opts.width - layoutWidth) / 2;

    if (this.opts.backgroundColor) this.populateBackground();
    this.populateFrontLabel();
    this.populateLayout();
    this.populateLegend(layoutWidth);
    this.stage.draw();
  }

  /**
   * Create a full sized background layer.
   */
  private populateBackground(): void {
    const backLayer = new Layer({
      preventDefault: false,
    });

    const rect = new Rect({
      x: 0,
      y: 0,
      width: this.opts.width,
      height: this.opts.height,
      fill: this.opts.backgroundColor,
      preventDefault: false,
    });
    backLayer.add(rect);
    this.stage.add(backLayer);
  }

  /**
   * Populate the Stage with the seat layout.
   */
  private populateLayout(): void {
    const layer = new Layer({
      preventDefault: false,
    });

    const startX =
      this.centeringOffset + this.opts.rowLabelWidth + this.opts.seatWidth / 2;
    // 60 pixels is to offset the front label
    const startY = 80 + this.opts.seatWidth / 2;

    const seatList = multiArray(this.layout, this.opts.rowWidth);
    for (const [rowIndex, row] of seatList.entries()) {
      const yOffset = startY + this.seatWidth * rowIndex;
      const label = this.buildRowLabel(rowIndex + 1, yOffset);
      layer.add(label);

      for (const [colIndex, col] of row.entries()) {
        // If id is not provided, leave an empty space
        if (col.id) {
          const seat = this.buildSeat(
            col,
            startX + this.seatWidth * colIndex,
            yOffset,
          );
          layer.add(seat.shape);
        }
      }
    }

    this.stage.add(layer);
  }

  private populateFrontLabel(): void {
    const layer = new Layer({
      preventDefault: false,
    });

    const rect = new Rect({
      y: 10,
      stroke: this.opts.textColor,
      width: this.stage.width() / 2,
      height: 40,
      preventDefault: false,
    });
    centerKonvaNode(rect, this.stage);
    layer.add(rect);

    const label = new KText({
      y: 20,
      fontSize: 20,
      fontStyle: 'bold',
      verticalAlign: 'middle',
      fill: this.opts.textColor,
      text: 'FRONT',
      preventDefault: false,
    });
    // Center in the middle of the canvas once we know the width
    // of the label itelf
    centerKonvaNode(label, this.stage);

    layer.add(label);

    this.stage.add(layer);
  }

  private populateLegend(layoutWidth: number): void {
    const legend = new Legend(layoutWidth, this.opts);
    centerKonvaNode(legend.shape, this.stage);

    const layer = new Layer({
      preventDefault: false,
    });
    layer.add(legend.shape);
    this.stage.add(layer);
  }

  /**
   * Create a Seat object.
   * @param {SeatListItem} s An object with seat details.
   * @param {number} xOffset The X offset in pixels.
   * @param {number} yOffset The Y offset in pixels.
   */
  private buildSeat(
    s: SeatListItem,
    xOffset: number,
    yOffset: number,
  ): SeatShape {
    const seat = new EventSeat(
      Object.assign(
        {
          id: s.id,
          x: xOffset,
          y: yOffset,
          unavailable: s.unavailable,
          booked: s.booked,
        },
        this.opts,
      ),
    ).seatShape;

    seat.shape.on('click tap', (e) => {
      // Click seems to happen on the circle, so get the group
      const shape = e.target.findAncestor('Group');
      const seat = shape.getAttr('seat');
      const seats = this.getSelected();
      if (seat.booked || seat.unavailable) return;

      if (!seat.isSelected && seats.length >= this.opts.maxSeats) {
        this.trigger('popcorn.maxseats', { total: seats.length });
        return;
      }

      // Alter the count, as it's taken before changing the state
      if (seat.isSelected) {
        seat.deselect();
        this.trigger('popcorn.deselectseat', {
          seatid: seat.id,
          total: seats.length - 1,
        });
      } else {
        seat.select();
        this.trigger('popcorn.selectseat', {
          seatid: seat.id,
          total: seats.length + 1,
        });
      }
      this.redraw();
    });

    return seat;
  }

  private getSelected() {
    return this.stage.find('.selected');
  }

  /**
   * Create a Konva Text object for the row number.
   * @param {number} rowNumber The row number.
   * @param {number} yOffset The Y offset in pixels.
   */
  private buildRowLabel(rowNumber: number, yOffset: number): KText {
    const label = new KText({
      x: this.centeringOffset,
      y: yOffset - this.opts.seatMargin / 2,
      fontSize: this.opts.seatWidth * 0.6,
      fontStyle: 'bold',
      verticalAlign: 'middle',
      fill: this.opts.textColor,
      text: rowLabel(rowNumber),
      preventDefault: false,
    });

    return label;
  }

  /**
   * Trigger a custom event.
   * @param {string} eventName Name of the event.
   * @param {Object} eventData An object with any associated data.
   */
  private trigger(
    eventName: PopcornEvent,
    eventData: Record<string, unknown>,
  ): void {
    const detail = eventData || {};
    const event = new CustomEvent(eventName, {
      detail: detail,
    });
    this.elem.dispatchEvent(event);
  }

  /**
   * Register an event handler.
   * @param {string} eventName Name of the event.
   * @param {function} eventHandler A callback function.
   */
  public on(eventName: string, eventHandler: (event: Event) => void) {
    this.elem.addEventListener(eventName, eventHandler);
  }

  /**
   * Redraw the canvas.
   */
  public redraw(): void {
    this.stage.draw();
  }

  /**
   * Destroy the canvas.
   */
  public destroy(): void {
    this.stage.destroy();
  }

  /**
   * Get the selected seats.
   */
  public get selected(): string[] {
    const seats = this.getSelected();
    const selected = seats.map((seat) => seat.id());
    return selected;
  }

  /**
   * Set the selected seats.
   */
  public set selected(seats: string[]) {
    this.getSelected().forEach((shape) => {
      const seat = shape.getAttr('seat');

      seat.deselect();
    });

    seats.forEach((id) => {
      const shape = this.stage.find(`#${id}`)[0];
      const seat = shape.getAttr('seat');

      seat.select();
    });

    this.redraw();
  }
}

// Assign to window for use in standard browser
window.Popcorn = Popcorn;

export default Popcorn;
