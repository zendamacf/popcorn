import Seat from './seat';


class BookedSeat {
  constructor(opts) {
    return new Seat(opts.bookedColor, opts);
  }
}

export default BookedSeat;