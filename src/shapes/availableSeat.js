import Seat from './seat';


class AvailableSeat {
  constructor(opts) {
    return new Seat(opts.seatColor, opts);
  }
}

export default AvailableSeat;