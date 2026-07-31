import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULTS } from './defaults';

const { Group, Text, SeatShape, seatOpts, texts, group } = vi.hoisted(() => {
  const seatOpts: unknown[] = [];
  const texts: { opts: Record<string, unknown> }[] = [];
  const group = { add: vi.fn().mockReturnThis() };

  class Group {
    add = group.add;
    constructor(public opts: Record<string, unknown>) {}
  }

  class Text {
    constructor(public opts: Record<string, unknown>) {
      texts.push(this);
    }
  }

  function SeatShape(opts: unknown) {
    seatOpts.push(opts);
    return { shape: { id: seatOpts.length } };
  }

  return { Group, Text, SeatShape, seatOpts, texts, group };
});

vi.mock('konva/lib/Group', () => ({ Group }));
vi.mock('konva/lib/shapes/Text', () => ({ Text }));
vi.mock('./shapes/seatShape', () => ({ default: SeatShape }));

import Legend from './legend';

const opts: PopcornOptions = {
  ...DEFAULTS,
  elem: '#seats',
  width: 400,
  height: 300,
  rowWidth: 4,
  maxSeats: 2,
  seatList: [],
};

describe('Legend', () => {
  beforeEach(() => {
    seatOpts.length = 0;
    texts.length = 0;
    vi.clearAllMocks();
    group.add.mockReturnThis();
  });

  it('adds available, unavailable, booked, and selected entries', () => {
    const legend = new Legend(200, opts);

    expect(seatOpts).toEqual([
      {
        x: 12.5,
        seatWidth: DEFAULTS.seatWidth,
        fillColor: DEFAULTS.seatColor,
        unavailable: false,
        unavailableColor: DEFAULTS.unavailableColor,
        seatSvg: undefined,
      },
      {
        x: 62.5,
        seatWidth: DEFAULTS.seatWidth,
        fillColor: DEFAULTS.seatColor,
        unavailable: true,
        unavailableColor: DEFAULTS.unavailableColor,
        seatSvg: undefined,
      },
      {
        x: 112.5,
        seatWidth: DEFAULTS.seatWidth,
        fillColor: DEFAULTS.bookedColor,
        unavailable: false,
        unavailableColor: DEFAULTS.unavailableColor,
        seatSvg: undefined,
      },
      {
        x: 162.5,
        seatWidth: DEFAULTS.seatWidth,
        fillColor: DEFAULTS.selectedColor,
        unavailable: false,
        unavailableColor: DEFAULTS.unavailableColor,
        seatSvg: undefined,
      },
    ]);

    expect(texts.map((text) => text.opts.text)).toEqual([
      'Available',
      'Unavailable',
      'Booked',
      'Selected',
    ]);
    expect(group.add).toHaveBeenCalledTimes(8);
    expect(legend.shape).toBeInstanceOf(Group);
  });

  it('passes seatSvg through to each legend seat', () => {
    new Legend(200, { ...opts, seatSvg: 'M0 0 H10 V10 Z' });

    expect(
      seatOpts.every(
        (seat) => (seat as { seatSvg?: string }).seatSvg === 'M0 0 H10 V10 Z',
      ),
    ).toBe(true);
  });
});
