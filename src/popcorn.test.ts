import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type Handler = (event: {
  target: { findAncestor: (selector: string) => unknown };
}) => void;

const {
  stage,
  layers,
  clickHandlers,
  eventSeatCalls,
  nodesById,
  MockEventSeat,
  MockLegend,
  Stage,
  Layer,
  Rect,
  Text,
} = vi.hoisted(() => {
  const clickHandlers: Handler[] = [];
  const eventSeatCalls: unknown[] = [];
  const nodesById = new Map<string, { getAttr: (key: string) => unknown }>();

  const stage = {
    width: vi.fn(() => 1000),
    add: vi.fn(),
    draw: vi.fn(),
    destroy: vi.fn(),
    getAbsolutePosition: vi.fn(() => ({ x: 0, y: 0 })),
    setAbsolutePosition: vi.fn(),
    offsetX: vi.fn(),
  };

  const layers: {
    add: ReturnType<typeof vi.fn>;
    batchDraw: ReturnType<typeof vi.fn>;
  }[] = [];

  function Stage(_opts: unknown) {
    return stage;
  }

  class Layer {
    add = vi.fn().mockReturnThis();
    batchDraw = vi.fn();
    constructor() {
      layers.push(this);
    }
  }

  class Rect {
    getAbsolutePosition = vi.fn(() => ({ x: 0, y: 10 }));
    setAbsolutePosition = vi.fn();
    offsetX = vi.fn();
    width = vi.fn(() => 100);
  }

  class Text {
    getAbsolutePosition = vi.fn(() => ({ x: 0, y: 20 }));
    setAbsolutePosition = vi.fn();
    offsetX = vi.fn();
    width = vi.fn(() => 50);
    constructor(public opts: Record<string, unknown>) {}
  }

  function MockEventSeat(
    this: {
      id?: string;
      booked: boolean;
      unavailable: boolean;
      isSelected: boolean;
      select: ReturnType<typeof vi.fn>;
      deselect: ReturnType<typeof vi.fn>;
      seatShape: unknown;
    },
    opts: Record<string, unknown>,
  ) {
    eventSeatCalls.push(opts);
    this.id = opts.id as string | undefined;
    this.booked = Boolean(opts.booked);
    this.unavailable = Boolean(opts.unavailable);
    this.isSelected = false;
    this.select = vi.fn(function select(this: { isSelected: boolean }) {
      this.isSelected = true;
    });
    this.deselect = vi.fn(function deselect(this: { isSelected: boolean }) {
      this.isSelected = false;
    });

    const group = {
      on: vi.fn((eventName: string, handler: Handler) => {
        if (eventName === 'click tap') clickHandlers.push(handler);
      }),
      getAttr: vi.fn((key: string) => (key === 'seat' ? this : undefined)),
    };

    nodesById.set(String(opts.id), group);
    this.seatShape = { shape: group };
  }

  function MockLegend() {
    return {
      shape: {
        getAbsolutePosition: vi.fn(() => ({ x: 0, y: 0 })),
        setAbsolutePosition: vi.fn(),
        offsetX: vi.fn(),
        width: vi.fn(() => 200),
      },
    };
  }

  return {
    stage,
    layers,
    clickHandlers,
    eventSeatCalls,
    nodesById,
    MockEventSeat,
    MockLegend,
    Stage,
    Layer,
    Rect,
    Text,
  };
});

vi.mock('konva/lib/Stage', () => ({ Stage }));
vi.mock('konva/lib/Layer', () => ({ Layer }));
vi.mock('konva/lib/shapes/Rect', () => ({ Rect }));
vi.mock('konva/lib/shapes/Text', () => ({ Text }));
vi.mock('./eventSeat', () => ({ default: MockEventSeat }));
vi.mock('./legend', () => ({ default: MockLegend }));

import Popcorn from './popcorn';

function mount(extra: Partial<PopcornInitOptions> = {}) {
  const elem = document.createElement('div');
  elem.id = 'seats';
  document.body.appendChild(elem);

  const popcorn = new Popcorn({
    elem: '#seats',
    width: 1000,
    height: 500,
    rowWidth: 2,
    maxSeats: 2,
    seatList: [
      { id: 'A1' },
      { id: 'A2', booked: true },
      {},
      { id: 'B1', unavailable: true },
    ],
    backgroundColor: '#202020',
    ...extra,
  });

  return { popcorn, elem };
}

function clickSeat(id: string) {
  const group = nodesById.get(id);
  const index = [...nodesById.keys()].indexOf(id);
  clickHandlers[index]({
    target: { findAncestor: () => group },
  });
}

describe('Popcorn', () => {
  it('attaches the constructor to window for browser script usage', () => {
    expect(window.Popcorn).toBe(Popcorn);
  });

  beforeEach(() => {
    document.body.innerHTML = '';
    clickHandlers.length = 0;
    eventSeatCalls.length = 0;
    nodesById.clear();
    layers.length = 0;
    vi.clearAllMocks();
    stage.width.mockReturnValue(1000);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('throws when seatList is missing', () => {
    expect(
      () =>
        new Popcorn({
          elem: '#seats',
          width: 100,
          height: 100,
          rowWidth: 4,
          maxSeats: 2,
        } as PopcornInitOptions),
    ).toThrow('Popcorn: seatList is required.');
  });

  it('throws when the target element is missing', () => {
    expect(
      () =>
        new Popcorn({
          elem: '#missing',
          width: 100,
          height: 100,
          rowWidth: 4,
          maxSeats: 2,
          seatList: [{ id: 'A1' }],
        }),
    ).toThrow('Popcorn: element not found for selector "#missing"');
  });

  it('throws on invalid rowWidth', () => {
    const elem = document.createElement('div');
    elem.id = 'seats';
    document.body.appendChild(elem);

    expect(
      () =>
        new Popcorn({
          elem: '#seats',
          width: 100,
          height: 100,
          rowWidth: 0,
          maxSeats: 2,
          seatList: [{ id: 'A1' }],
        }),
    ).toThrow('Popcorn: rowWidth must be >= 1');
  });

  it('builds seats for entries with ids and skips empty placeholders', () => {
    mount();

    expect(eventSeatCalls.map((call) => (call as { id?: string }).id)).toEqual([
      'A1',
      'A2',
      'B1',
    ]);
    expect(stage.add).toHaveBeenCalled();
    expect(stage.draw).toHaveBeenCalled();
    expect(layers.length).toBeGreaterThan(0);
  });

  it('passes lean style options to EventSeat', () => {
    mount();

    expect(eventSeatCalls[0]).toEqual(
      expect.objectContaining({
        id: 'A1',
        seatWidth: 30,
        seatColor: 'lightgrey',
        bookedColor: 'red',
        selectedColor: '#00356D',
        unavailableColor: 'black',
      }),
    );
    expect(eventSeatCalls[0]).not.toHaveProperty('seatList');
    expect(eventSeatCalls[0]).not.toHaveProperty('maxSeats');
  });

  it('skips background layer when backgroundColor is omitted', () => {
    mount({ backgroundColor: undefined });

    // front label, seat layout, legend — no dedicated background layer path asserted via Stage add count
    expect(stage.add.mock.calls.length).toBe(3);
  });

  it('registers listeners, redraws, off, and destroys without leaking handlers', () => {
    const { popcorn, elem } = mount();
    const handler = vi.fn();

    popcorn.on('popcorn.selectseat', handler);
    elem.dispatchEvent(
      new CustomEvent('popcorn.selectseat', { detail: { seatid: 'A1' } }),
    );
    expect(handler).toHaveBeenCalledTimes(1);

    popcorn.off('popcorn.selectseat', handler);
    elem.dispatchEvent(
      new CustomEvent('popcorn.selectseat', { detail: { seatid: 'A1' } }),
    );
    expect(handler).toHaveBeenCalledTimes(1);

    popcorn.on('popcorn.selectseat', handler);
    popcorn.redraw();
    expect(layers.some((layer) => layer.batchDraw.mock.calls.length > 0)).toBe(
      true,
    );

    popcorn.destroy();
    expect(stage.destroy).toHaveBeenCalled();
    elem.dispatchEvent(
      new CustomEvent('popcorn.selectseat', { detail: { seatid: 'A1' } }),
    );
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('selects seats on click and emits select events', () => {
    const { popcorn } = mount();
    const selected: unknown[] = [];
    popcorn.on('popcorn.selectseat', (event) => {
      selected.push((event as CustomEvent).detail);
    });

    clickSeat('A1');

    expect(selected).toEqual([{ seatid: 'A1', total: 1 }]);
    expect(popcorn.selected).toEqual(['A1']);
    expect(layers.some((layer) => layer.batchDraw.mock.calls.length > 0)).toBe(
      true,
    );
  });

  it('emits maxseats when the selection limit is reached', () => {
    const { popcorn } = mount({
      maxSeats: 1,
      seatList: [{ id: 'A1' }, { id: 'A2' }],
    });
    const maxed: unknown[] = [];
    popcorn.on('popcorn.maxseats', (event) => {
      maxed.push((event as CustomEvent).detail);
    });

    clickSeat('A1');
    clickSeat('A2');

    expect(maxed).toEqual([{ total: 1 }]);
    expect(popcorn.selected).toEqual(['A1']);
  });

  it('deselects an already selected seat on click', () => {
    const { popcorn } = mount();
    const deselected: unknown[] = [];
    popcorn.on('popcorn.deselectseat', (event) => {
      deselected.push((event as CustomEvent).detail);
    });

    clickSeat('A1');
    clickSeat('A1');

    const seatApi = nodesById.get('A1')?.getAttr('seat') as {
      deselect: ReturnType<typeof vi.fn>;
    };
    expect(seatApi.deselect).toHaveBeenCalled();
    expect(deselected).toEqual([{ seatid: 'A1', total: 0 }]);
    expect(popcorn.selected).toEqual([]);
  });

  it('ignores clicks on booked seats', () => {
    mount();
    clickSeat('A2');

    const seatApi = nodesById.get('A2')?.getAttr('seat') as {
      select: ReturnType<typeof vi.fn>;
    };
    expect(seatApi.select).not.toHaveBeenCalled();
  });

  it('ignores clicks when the ancestor group is missing', () => {
    mount();
    expect(() =>
      clickHandlers[0]({
        target: { findAncestor: () => null },
      }),
    ).not.toThrow();
  });

  it('gets and sets the selected seat ids', () => {
    const { popcorn } = mount();
    const a1 = nodesById.get('A1')?.getAttr('seat') as {
      select: ReturnType<typeof vi.fn>;
      deselect: ReturnType<typeof vi.fn>;
    };

    expect(popcorn.selected).toEqual([]);

    popcorn.selected = ['A1'];
    expect(a1.select).toHaveBeenCalled();
    expect(popcorn.selected).toEqual(['A1']);
    expect(layers.some((layer) => layer.batchDraw.mock.calls.length > 0)).toBe(
      true,
    );
  });

  it('rejects unknown or unselectable ids when setting selected', () => {
    const { popcorn } = mount();

    expect(() => {
      popcorn.selected = ['missing'];
    }).toThrow('cannot select unknown seat id');

    expect(() => {
      popcorn.selected = ['A2'];
    }).toThrow('is not selectable');
  });
});
