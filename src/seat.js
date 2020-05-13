import { Circle } from 'konva';
import { SEAT_WIDTH } from './layout';


class Seat {
  constructor(id, x, y, available) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.available = available;
    this.selected = false;
  }

  color() {
    if (this.selected) return 'red';
    if (!this.available) return 'lightgrey';
    return '#1b728d';
  }

  name() {
    if (this.selected) return 'selected';
    return 'unselected';
  }

  get shape() {
    const circle = new Circle({
      id: this.id,
      x: this.x,
      y: this.y,
      name: this.name(),
      radius: SEAT_WIDTH / 2,
      fill: this.color(),
    });

    circle
      .on('mouseenter', (e) => {
        const container = e.target.getStage().container();
        if (!this.available) {
          container.style.cursor = 'not-allowed';
        } else {
          container.style.cursor = 'pointer';
        }
      })
      .on('mouseleave', (e) => {
        const container = e.target.getStage().container();
        container.style.cursor = '';
      })
      .setAttr('seat', this);
    return circle;
  }
}

export default Seat;