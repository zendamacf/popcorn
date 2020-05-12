import { Circle } from 'konva';
import { SEAT_WIDTH, MAX_SEATS } from './layout';


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
      .on('click tap', (e) => {
        if (!this.available) return;
        const seat = e.target;
        const stage = seat.getStage();
        const seats = stage.find('.selected');

        if (!this.selected && seats.length >= MAX_SEATS) {
          alert(`You already have ${MAX_SEATS} seats selected.`);
          return;
        }

        this.selected = !this.selected;
        seat.fill(this.color());
        seat.name(this.name());
        stage.draw();
      })
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
      });
    return circle;
  }
}

export default Seat;