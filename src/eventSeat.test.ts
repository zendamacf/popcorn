import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULTS } from './defaults';

const { SeatShape, shape, body, createdWith, container } = vi.hoisted(() => {
  const container = { style: { cursor: '' } };
  const body = { fill: vi.fn() };
  const shape = {
    on: vi.fn(),
    setAttr: vi.fn(),
    name: vi.fn(),
    getStage: vi.fn(() => ({ container: () => container })),
  };
  shape.on.mockReturnValue(shape);
  shape.setAttr.mockReturnValue(shape);

  const createdWith: unknown[] = [];

  function SeatShape(
    this: { shape: typeof shape; body: typeof body },
    opts: unknown,
  ) {
    createdWith.push(opts);
    this.shape = shape;
    this.body = body;
  }

  return { SeatShape, shape, body, createdWith, container };
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
    container.style.cursor = '';
    shape.on.mockReturnValue(shape);
    shape.setAttr.mockReturnValue(shape);
    shape.getStage.mockReturnValue({ container: () => container });
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
      seatSvg: undefined,
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
    expect(body.fill).toHaveBeenCalledWith(DEFAULTS.selectedColor);
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
    expect(body.fill).not.toHaveBeenCalled();
  });

  it('deselects a selected seat', () => {
    const seat = new EventSeat({ ...baseOpts, id: 'A1' });
    seat.select();
    body.fill.mockClear();
    shape.name.mockClear();

    seat.deselect();

    expect(seat.name()).toBe('unselected');
    expect(seat.color()).toBe(DEFAULTS.seatColor);
    expect(body.fill).toHaveBeenCalledWith(DEFAULTS.seatColor);
    expect(shape.name).toHaveBeenCalledWith('unselected');
  });

  it('passes seatSvg through when configured', () => {
    new EventSeat({
      ...baseOpts,
      id: 'A1',
      seatSvg: 'M0 0 H10 V10 Z',
    });

    expect(createdWith[0]).toMatchObject({
      seatSvg: 'M0 0 H10 V10 Z',
    });
  });

  it('sets cursor style from hover handlers', () => {
    new EventSeat({ ...baseOpts, id: 'A1' });

    expect(shape.on).toHaveBeenCalledWith(
      'mouseenter pointerenter',
      expect.any(Function),
    );
    expect(shape.on).toHaveBeenCalledWith(
      'mouseleave pointerleave',
      expect.any(Function),
    );

    const enter = shape.on.mock.calls.find(
      ([eventName]) => eventName === 'mouseenter pointerenter',
    )?.[1];
    const leave = shape.on.mock.calls.find(
      ([eventName]) => eventName === 'mouseleave pointerleave',
    )?.[1];

    enter();
    expect(container.style.cursor).toBe('pointer');

    leave();
    expect(container.style.cursor).toBe('');

    new EventSeat({ ...baseOpts, id: 'B1', booked: true });
    const bookedEnter = shape.on.mock.calls
      .filter(([eventName]) => eventName === 'mouseenter pointerenter')
      .slice(-1)[0]?.[1];
    bookedEnter();
    expect(container.style.cursor).toBe('not-allowed');
  });

  it('ignores hover when the stage container is missing', () => {
    shape.getStage.mockReturnValue(null as never);
    new EventSeat({ ...baseOpts, id: 'A1' });
    const enter = shape.on.mock.calls.find(
      ([eventName]) => eventName === 'mouseenter pointerenter',
    )?.[1];
    const leave = shape.on.mock.calls.find(
      ([eventName]) => eventName === 'mouseleave pointerleave',
    )?.[1];

    expect(() => enter()).not.toThrow();
    expect(() => leave()).not.toThrow();
  });
});
