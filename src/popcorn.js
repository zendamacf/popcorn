import { Stage, Layer } from 'konva';
import Seat from './seat';
import { SEAT_WIDTH, SEAT_MARGIN } from './layout';

const seats = {
  width: 12,
  count: 53,
};

let stage;

window.showSeats = function(elemId, height, width) {
  stage = new Stage({
    container: elemId,
    width: width,
    height: height,
  });

  const layer = new Layer();

  let xOffset = SEAT_WIDTH / 2;
  let yOffset = SEAT_WIDTH / 2;
  for (let i = 0; i < seats.count; i++) {
    const seat = new Seat(
      i + 1,
      xOffset,
      yOffset,
      (i % 13 === 0) ? false : true
    ).shape;

    layer.add(seat);

    if ((i + 1) % seats.width === 0) {
      xOffset = SEAT_WIDTH / 2;
      yOffset += SEAT_WIDTH + SEAT_MARGIN;
    } else {
      xOffset += SEAT_WIDTH + SEAT_MARGIN;
    }
  }

  stage.add(layer);
  layer.draw();
};

window.getSeats = function() {
  const seats = stage.find('.selected');
  const selected = seats.map(seat => seat.id());
  if (selected.length > 0) {
    alert(`You have selected seats ${selected}`);
  } else {
    alert('You have no seats selected.');
  }
};