import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULTS } from './defaults';

const { SeatShape, shape, circle, createdWith } = vi.hoisted(() => {
  const circle = { fill: vi.fn() };
  const shape = {
    on: vi.fn(),
    setAttr: vi.fn(),
    findOne: vi.fn(() => circle),
    name: vi.fn(),
  };
  shape.on.mockReturnValue(shape);
  shape.setAttr.mockReturnValue(shape);

  const createdWith: unknown[] = [];

  function SeatShape(this: { shape: typeof shape }, opts: unknown) {
    createdWith.push(opts);
    this.shape = shape;
  }

  return { SeatShape, shape, circle, createdWith };
});

vi.mock('./shapes/seatShape', () => ({ default: SeatShape }));

import EventSeat from './eventSeat';

const baseOpts = {
  ...DEFAULTS,
  elem: '#seats',
  width: 100,
  height: 100,
  rowWidth: 4,
  maxSeats: 2,
  seatList: [],
  x: 5,
  y: 10,
};

describe('EventSeat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createdWith.length = 0;
    shape.on.mockReturnValue(shape);
    shape.setAttr.mockReturnValue(shape);
    shape.findOne.mockReturnValue(circle);
  });

  it('creates a seat shape with available styling', () => {
    new EventSeat({ ...baseOpts, id: 'A1' });

    expect(createdWith[0]).toEqual({
      id: 'A1',
      x: 5,
      y: 10,
      name: 'unselected',
      seatWidth: DEFAULTS.seatWidth,
      fillColor: DEFAULTS.seatColor,
      unavailable: false,
      unavailableColor: DEFAULTS.unavailableColor,
    });
    expect(shape.setAttr).toHaveBeenCalledWith('seat', expect.any(EventSeat));
  });

  it('uses booked colour and marks unavailable seats', () => {
    new EventSeat({
      ...baseOpts,
      id: 'B1',
      booked: true,
      unavailable: true,
    });

    expect(createdWith[0]).toMatchObject({
      fillColor: DEFAULTS.bookedColor,
      unavailable: true,
      name: 'unselected',
    });
  });

  it('selects an available seat and updates fill/name', () => {
    const seat = new EventSeat({ ...baseOpts, id: 'A1' });

    seat.select();

    expect(seat.name()).toBe('selected');
    expect(seat.color()).toBe(DEFAULTS.selectedColor);
    expect(circle.fill).toHaveBeenCalledWith(DEFAULTS.selectedColor);
    expect(shape.name).toHaveBeenCalledWith('selected');
  });

  it('does not select booked or unavailable seats', () => {
    const booked = new EventSeat({ ...baseOpts, id: 'B1', booked: true });
    const unavailable = new EventSeat({
      ...baseOpts,
      id: 'U1',
      unavailable: true,
    });

    booked.select();
    unavailable.select();

    expect(booked.name()).toBe('unselected');
    expect(unavailable.name()).toBe('unselected');
    expect(circle.fill).not.toHaveBeenCalled();
  });

  it('deselects a selected seat', () => {
    const seat = new EventSeat({ ...baseOpts, id: 'A1' });
    seat.select();
    circle.fill.mockClear();
    shape.name.mockClear();

    seat.deselect();

    expect(seat.name()).toBe('unselected');
    expect(seat.color()).toBe(DEFAULTS.seatColor);
    expect(circle.fill).toHaveBeenCalledWith(DEFAULTS.seatColor);
    expect(shape.name).toHaveBeenCalledWith('unselected');
  });

  it('sets cursor style from hover handlers', () => {
    new EventSeat({ ...baseOpts, id: 'A1' });
    const handlers = Object.fromEntries(
      shape.on.mock.calls.map(([eventName, handler]) => [eventName, handler]),
    );
    const container = { style: { cursor: '' } };
    const event = {
      target: {
        getStage: () => ({ container: () => container }),
      },
    };

    handlers.mouseenter(event);
    expect(container.style.cursor).toBe('pointer');

    handlers.mouseleave(event);
    expect(container.style.cursor).toBe('');

    const booked = new EventSeat({ ...baseOpts, id: 'B1', booked: true });
    const bookedHandlers = Object.fromEntries(
      shape.on.mock.calls
        .slice(-2)
        .map(([eventName, handler]) => [eventName, handler]),
    );
    bookedHandlers.mouseenter(event);
    expect(container.style.cursor).toBe('not-allowed');
    expect(booked.shape).toBe(booked.seatShape);
  });

  it('ignores hover when the stage container is missing', () => {
    new EventSeat({ ...baseOpts, id: 'A1' });
    const handlers = Object.fromEntries(
      shape.on.mock.calls.map(([eventName, handler]) => [eventName, handler]),
    );

    expect(() =>
      handlers.mouseenter({ target: { getStage: () => null } }),
    ).not.toThrow();
    expect(() =>
      handlers.mouseleave({
        target: { getStage: () => ({ container: () => null }) },
      }),
    ).not.toThrow();
  });
});
