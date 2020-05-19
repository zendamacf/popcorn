import Seat from './seat';


class SelectedSeat {
  constructor(opts) {
    return new Seat(opts.selectedColor, opts);
  }
}

export default SelectedSeat;