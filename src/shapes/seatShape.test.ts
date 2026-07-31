import { beforeEach, describe, expect, it, vi } from 'vitest';

const { Group, Circle, Line, circles, lines, groups } = vi.hoisted(() => {
  const circles: { opts: Record<string, unknown> }[] = [];
  const lines: { opts: Record<string, unknown> }[] = [];
  const groups: {
    opts: Record<string, unknown>;
    add: ReturnType<typeof vi.fn>;
  }[] = [];

  class Group {
    add = vi.fn().mockReturnThis();
    constructor(public opts: Record<string, unknown>) {
      groups.push(this);
    }
  }

  class Circle {
    constructor(public opts: Record<string, unknown>) {
      circles.push(this);
    }
  }

  class Line {
    constructor(public opts: Record<string, unknown>) {
      lines.push(this);
    }
  }

  return { Group, Circle, Line, circles, lines, groups };
});

vi.mock('konva/lib/Group', () => ({ Group }));
vi.mock('konva/lib/shapes/Circle', () => ({ Circle }));
vi.mock('konva/lib/shapes/Line', () => ({ Line }));

import SeatShape from './seatShape';

describe('SeatShape', () => {
  beforeEach(() => {
    circles.length = 0;
    lines.length = 0;
    groups.length = 0;
  });

  it('builds an available seat circle without an X', () => {
    const seat = new SeatShape({
      id: 'A1',
      x: 10,
      y: 20,
      name: 'unselected',
      seatWidth: 30,
      fillColor: 'lightgrey',
    });

    expect(groups[0].opts).toMatchObject({
      id: 'A1',
      x: 10,
      y: 20,
      name: 'unselected',
      preventDefault: false,
    });
    expect(circles[0].opts).toEqual({
      radius: 15,
      fill: 'lightgrey',
      opacity: 1,
    });
    expect(lines).toHaveLength(0);
    expect(groups[0].add).toHaveBeenCalledTimes(1);
    expect(seat.shape).toBe(groups[0]);
  });

  it('draws a faded circle and X for unavailable seats', () => {
    new SeatShape({
      seatWidth: 40,
      fillColor: 'grey',
      unavailable: true,
      unavailableColor: '#111',
    });

    expect(circles[0].opts).toEqual({
      radius: 20,
      fill: 'grey',
      opacity: 0.4,
    });
    expect(lines).toHaveLength(2);
    expect(lines[0].opts).toEqual({
      points: [-10, -10, 0, 0, 10, 10],
      stroke: '#111',
    });
    expect(lines[1].opts).toEqual({
      points: [-10, 10, 0, 0, 10, -10],
      stroke: '#111',
    });
    expect(groups[0].add).toHaveBeenCalledTimes(3);
  });
});
