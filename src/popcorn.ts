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

type SeatHandler = (event: Event) => void;

class Popcorn {
  private opts: PopcornOptions;
  private elem: HTMLDivElement;
  private layout: SeatListItem[];
  private stage: Stage;
  private seatWidth: number;
  private centeringOffset: number;
  private seatsById = new Map<string, EventSeat>();
  private selectedIds = new Set<string>();
  private listeners = new Map<string, Set<SeatHandler>>();
  private seatLayer!: Layer;
  private destroyed = false;

  constructor(options: PopcornInitOptions) {
    this.opts = { ...DEFAULTS, ...options };
    this.assertOptions(this.opts);

    const elem = document.querySelector<HTMLDivElement>(this.opts.elem);
    if (elem === null) {
      throw new Error(
        `Popcorn: element not found for selector "${this.opts.elem}"`,
      );
    }
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

  private assertOptions(opts: PopcornOptions): void {
    if (!opts.seatList) {
      throw new Error('Popcorn: seatList is required.');
    }
    if (!Number.isFinite(opts.rowWidth) || opts.rowWidth < 1) {
      throw new Error(`Popcorn: rowWidth must be >= 1 (got ${opts.rowWidth})`);
    }
    if (!Number.isFinite(opts.maxSeats) || opts.maxSeats < 1) {
      throw new Error(`Popcorn: maxSeats must be >= 1 (got ${opts.maxSeats})`);
    }
    if (!Number.isFinite(opts.width) || opts.width <= 0) {
      throw new Error(`Popcorn: width must be > 0 (got ${opts.width})`);
    }
    if (!Number.isFinite(opts.height) || opts.height <= 0) {
      throw new Error(`Popcorn: height must be > 0 (got ${opts.height})`);
    }
    if (!Number.isFinite(opts.seatWidth) || opts.seatWidth <= 0) {
      throw new Error(`Popcorn: seatWidth must be > 0 (got ${opts.seatWidth})`);
    }
    const ids = opts.seatList.map((s) => s.id).filter(Boolean) as string[];
    if (new Set(ids).size !== ids.length) {
      throw new Error('Popcorn: seatList contains duplicate ids.');
    }
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
    this.seatLayer = new Layer({
      preventDefault: false,
    });
    const layer = this.seatLayer;

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
    const eventSeat = new EventSeat({
      id: s.id,
      x: xOffset,
      y: yOffset,
      unavailable: s.unavailable,
      booked: s.booked,
      seatWidth: this.opts.seatWidth,
      seatColor: this.opts.seatColor,
      bookedColor: this.opts.bookedColor,
      selectedColor: this.opts.selectedColor,
      unavailableColor: this.opts.unavailableColor,
      seatSvg: this.opts.seatSvg,
    });
    if (s.id) this.seatsById.set(s.id, eventSeat);
    const seat = eventSeat.seatShape;

    seat.shape.on('click tap', (e) => {
      const shape = e.target.findAncestor('Group');
      if (!shape) return;
      const seat = shape.getAttr('seat') as EventSeat | undefined;
      if (!seat?.id) return;
      if (seat.booked || seat.unavailable) return;

      if (!seat.isSelected && this.selectedIds.size >= this.opts.maxSeats) {
        this.trigger('popcorn.maxseats', { total: this.selectedIds.size });
        return;
      }

      if (seat.isSelected) {
        seat.deselect();
        this.selectedIds.delete(seat.id);
        this.trigger('popcorn.deselectseat', {
          seatid: seat.id,
          total: this.selectedIds.size,
        });
      } else {
        seat.select();
        this.selectedIds.add(seat.id);
        this.trigger('popcorn.selectseat', {
          seatid: seat.id,
          total: this.selectedIds.size,
        });
      }
      this.redraw();
    });

    return seat;
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
  public on(eventName: string, eventHandler: SeatHandler): void {
    if (this.destroyed) return;
    this.elem.addEventListener(eventName, eventHandler);
    let set = this.listeners.get(eventName);
    if (!set) {
      set = new Set();
      this.listeners.set(eventName, set);
    }
    set.add(eventHandler);
  }

  /**
   * Remove an event handler previously registered with `on`.
   */
  public off(eventName: string, eventHandler: SeatHandler): void {
    this.elem.removeEventListener(eventName, eventHandler);
    this.listeners.get(eventName)?.delete(eventHandler);
  }

  /**
   * Redraw the canvas.
   */
  public redraw(): void {
    if (this.destroyed) return;
    this.seatLayer.batchDraw();
  }

  /**
   * Destroy the canvas.
   */
  public destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    for (const [name, handlers] of this.listeners) {
      for (const handler of handlers) {
        this.elem.removeEventListener(name, handler);
      }
    }
    this.listeners.clear();
    this.seatsById.clear();
    this.selectedIds.clear();
    this.elem.style.cursor = '';
    this.stage.destroy();
  }

  /**
   * Get the selected seats.
   */
  public get selected(): string[] {
    return [...this.selectedIds];
  }

  /**
   * Set the selected seats.
   */
  public set selected(seats: string[]) {
    if (this.destroyed) return;

    for (const id of this.selectedIds) {
      this.seatsById.get(id)?.deselect();
    }
    this.selectedIds.clear();

    for (const id of seats) {
      const seat = this.seatsById.get(id);
      if (!seat) {
        throw new Error(`Popcorn: cannot select unknown seat id "${id}"`);
      }
      if (seat.booked || seat.unavailable) {
        throw new Error(`Popcorn: seat "${id}" is not selectable`);
      }
      if (this.selectedIds.size >= this.opts.maxSeats) {
        throw new Error(
          `Popcorn: selection exceeds maxSeats (${this.opts.maxSeats})`,
        );
      }
      seat.select();
      this.selectedIds.add(id);
    }
    this.redraw();
  }
}

// Assign to window for use in standard browser
window.Popcorn = Popcorn;

export default Popcorn;
