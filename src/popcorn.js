import { Stage, Layer, Rect, Text as KText } from 'konva';
import EventSeat from './eventSeat';
import Legend from './legend';
import { DEFAULTS } from './defaults';
import { rowLabel, cloneArray, multiArray, centerKonvaNode } from './utils';


class Popcorn {
  constructor(options) {
    this.opts = Object.assign(DEFAULTS, options || {});
    if (!this.opts.seatList) throw 'No seatlist provided.';

    this.elem = document.querySelector(this.opts.elem);
    if (this.elem === null) throw 'Element not found.';

    this.layout = cloneArray(this.opts.seatList);

    this.stage = new Stage({
      container: this.elem,
      width: this.opts.width,
      height: this.opts.height,
    });

    this.seatWidth = this.opts.seatWidth + this.opts.seatMargin;
    // Center the seats in the middle of the canvas
    const layoutWidth = Math.min(this.layout.length, this.opts.rowWidth) * this.seatWidth + this.opts.rowLabelWidth;
    this.centeringOffset = (this.opts.width - layoutWidth) / 2;

    if (this.opts.backgroundColor) this._populateBackground();
    this._populateFrontLabel();
    this._populateLayout();
    this._populateLegend(layoutWidth);
    this.stage.draw();
  }

  /**
   * Create a full sized background layer.
   */
  _populateBackground() {
    const backLayer = new Layer();

    const rect = new Rect({
      x: 0,
      y: 0,
      width: this.opts.width,
      height: this.opts.height,
      fill: this.opts.backgroundColor,
    });
    backLayer.add(rect);
    this.stage.add(backLayer);
  }

  /**
   * Populate the Stage with the seat layout.
   */
  _populateLayout() {
    const layer = new Layer();

    const startX = this.centeringOffset + this.opts.rowLabelWidth + this.opts.seatWidth / 2;
    // 60 pixels is to offset the front label
    const startY = 80 + this.opts.seatWidth / 2;

    const seatList = multiArray(this.layout, this.opts.rowWidth);
    for (const [rowIndex, row] of seatList.entries()) {
      const yOffset = startY + this.seatWidth * rowIndex;
      const label = this._buildRowLabel(rowIndex + 1, yOffset);
      layer.add(label);

      for (const [colIndex, col] of row.entries()) {
        // If id is not provided, leave an empty space
        if (col.id) {
          const seat = this._buildSeat(col, startX + this.seatWidth * colIndex, yOffset);
          layer.add(seat);
        }
      }
    }

    this.stage.add(layer);
  }

  _populateFrontLabel() {
    const layer = new Layer();

    const rect = new Rect({
      y: 10,
      stroke: this.opts.textColor,
      width: this.stage.width() / 2,
      height: 40,
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
    });
    // Center in the middle of the canvas once we know the width
    // of the label itelf
    centerKonvaNode(label, this.stage);

    layer.add(label);

    this.stage.add(layer);
  }

  _populateLegend(layoutWidth) {
    const legend = new Legend(layoutWidth, this.opts);
    centerKonvaNode(legend, this.stage);

    const layer = new Layer();
    layer.add(legend);
    this.stage.add(layer);
  }

  /**
   * Create a Seat object.
   * @param {Object} s An object with seat details.
   * @param {number} xOffset The X offset in pixels.
   * @param {number} yOffset The Y offset in pixels.
   */
  _buildSeat(s, xOffset, yOffset) {
    const seat = new EventSeat(
      Object.assign(
        {
          id: s.id,
          x: xOffset,
          y: yOffset,
          unavailable: s.unavailable,
          booked: s.booked,
        },
        this.opts
      )
    ).shape;

    seat.on('click tap', (e) => {
      // Click seems to happen on the circle, so get the group
      const shape = e.target.findAncestor('Group');
      const seat = shape.getAttr('seat');
      const seats = this._getSelected();
      if (seat.booked || seat.unavailable) return;

      if (!seat.isSelected && seats.length >= this.opts.maxSeats) {
        this._trigger('popcorn.maxseats', {total: seats.length});
        return;
      }

      // Alter the count, as it's taken before changing the state
      if (seat.isSelected) {
        seat.deselect();
        this._trigger('popcorn.deselectseat', {seatid: seat.id, total: seats.length - 1});
      } else {
        seat.select();
        this._trigger('popcorn.selectseat', {seatid: seat.id, total: seats.length + 1});
      }
      this.redraw();

    });

    return seat;
  }

  _getSelected() {
    return this.stage.find('.selected');
  }

  /**
   * Create a Konva Text object for the row number.
   * @param {number} rowNumber The row number.
   * @param {number} yOffset The Y offset in pixels.
   */
  _buildRowLabel(rowNumber, yOffset) {
    const label = new KText({
      x: this.centeringOffset,
      y: yOffset - this.opts.seatMargin / 2,
      fontSize: this.opts.seatWidth * 0.6,
      fontStyle: 'bold',
      verticalAlign: 'middle',
      fill: this.opts.textColor,
      text: rowLabel(rowNumber),
    });

    return label;
  }

  /**
   * Trigger a custom event.
   * @param {string} eventName Name of the event.
   * @param {Object} eventData An object with any associated data.
   */
  _trigger(eventName, eventData) {
    const detail = eventData || {};
    const event = new CustomEvent(
      eventName,
      {
        detail: detail
      }
    );
    this.elem.dispatchEvent(event);
  }

  /**
   * Register an event handler.
   * @param {string} eventName Name of the event.
   * @param {function} eventHandler A callback function.
   */
  on(eventName, eventHandler) {
    this.elem.addEventListener(
      eventName,
      eventHandler
    );
  }

  /**
   * Redraw the canvas.
   */
  redraw() {
    this.stage.draw();
  }

  /**
   * Destroy the canvas.
   */
  destroy() {
    this.stage.destroy();
  }

  /**
   * Get the selected seats.
   */
  get selected() {
    const seats = this._getSelected();
    const selected = seats.map(seat => seat.id());
    return selected;
  }

  /**
   * Set the selected seats.
   */
  set selected(seats) {
    this._getSelected().each((shape) => {
      const seat = shape.getAttr('seat');

      seat.deselect();
    });

    seats.forEach(id => {
      const shape = this.stage.find(`#${id}`)[0];
      const seat = shape.getAttr('seat');

      seat.select();
    });

    this.redraw();
  }
}

// Assign to window for use in standard browser
window.Popcorn = Popcorn;