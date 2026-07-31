import { beforeEach, describe, expect, it, vi } from 'vitest';

const { Group, Circle, Line, Path, circles, lines, paths, groups } = vi.hoisted(
  () => {
    const circles: { opts: Record<string, unknown> }[] = [];
    const lines: { opts: Record<string, unknown> }[] = [];
    const paths: {
      opts: Record<string, unknown>;
      scaleX: ReturnType<typeof vi.fn>;
      scaleY: ReturnType<typeof vi.fn>;
      offsetX: ReturnType<typeof vi.fn>;
      offsetY: ReturnType<typeof vi.fn>;
      getSelfRect: ReturnType<typeof vi.fn>;
    }[] = [];
    const groups: {
      opts: Record<string, unknown>;
      add: ReturnType<typeof vi.fn>;
      findOne: ReturnType<typeof vi.fn>;
      children: unknown[];
    }[] = [];

    class Group {
      add = vi.fn((child: unknown) => {
        this.children.push(child);
        return this;
      });
      children: unknown[] = [];
      findOne = vi.fn((selector: string) => {
        if (selector === '.seat-body') {
          return this.children[0];
        }
        return undefined;
      });
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

    class Path {
      scaleX = vi.fn();
      scaleY = vi.fn();
      offsetX = vi.fn();
      offsetY = vi.fn();
      getSelfRect = vi.fn(() => ({ x: 0, y: 0, width: 20, height: 10 }));
      constructor(public opts: Record<string, unknown>) {
        paths.push(this);
      }
    }

    return { Group, Circle, Line, Path, circles, lines, paths, groups };
  },
);

vi.mock('konva/lib/Group', () => ({ Group }));
vi.mock('konva/lib/shapes/Circle', () => ({ Circle }));
vi.mock('konva/lib/shapes/Line', () => ({ Line }));
vi.mock('konva/lib/shapes/Path', () => ({ Path }));

import SeatShape from './seatShape';

describe('SeatShape', () => {
  beforeEach(() => {
    circles.length = 0;
    lines.length = 0;
    paths.length = 0;
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
      name: 'seat-body',
      radius: 15,
      fill: 'lightgrey',
      opacity: 1,
    });
    expect(lines).toHaveLength(0);
    expect(paths).toHaveLength(0);
    expect(groups[0].add).toHaveBeenCalledTimes(1);
    expect(seat.shape).toBe(groups[0]);
    expect(seat.body).toBe(circles[0]);
  });

  it('draws a faded circle and X for unavailable seats', () => {
    new SeatShape({
      seatWidth: 40,
      fillColor: 'grey',
      unavailable: true,
      unavailableColor: '#111',
    });

    expect(circles[0].opts).toEqual({
      name: 'seat-body',
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

  it('builds an SVG path seat scaled to seatWidth', () => {
    const seat = new SeatShape({
      seatWidth: 40,
      fillColor: 'blue',
      seatSvg: 'M0 0 H20 V10 H0 Z',
    });

    expect(circles).toHaveLength(0);
    expect(paths[0].opts).toEqual({
      name: 'seat-body',
      data: 'M0 0 H20 V10 H0 Z',
      fill: 'blue',
      opacity: 1,
    });
    // Bounds are 20x10, so scale = 40 / 20 = 2
    expect(paths[0].scaleX).toHaveBeenCalledWith(2);
    expect(paths[0].scaleY).toHaveBeenCalledWith(2);
    expect(paths[0].offsetX).toHaveBeenCalledWith(10);
    expect(paths[0].offsetY).toHaveBeenCalledWith(5);
    expect(seat.body).toBe(paths[0]);
  });
});
