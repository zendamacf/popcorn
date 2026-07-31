import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type Handler = (event: {
  target: { findAncestor: (selector: string) => unknown };
}) => void;

const {
  stage,
  layers,
  clickHandlers,
  eventSeatCalls,
  selectedNodes,
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
  const selectedNodes: {
    id: () => string;
    getAttr: (key: string) => unknown;
  }[] = [];
  const nodesById = new Map<string, { getAttr: (key: string) => unknown }>();

  const collection = <T>(items: T[]) => {
    const value = Object.assign([...items], {
      toArray: () => [...items],
    });
    return value;
  };

  const stage = {
    width: vi.fn(() => 1000),
    add: vi.fn(),
    draw: vi.fn(),
    destroy: vi.fn(),
    find: vi.fn((selector: string) => {
      if (selector === '.selected') return collection(selectedNodes);
      if (selector.startsWith('#')) {
        const node = nodesById.get(selector.slice(1));
        return collection(node ? [node] : []);
      }
      return collection([]);
    }),
    getAbsolutePosition: vi.fn(() => ({ x: 0, y: 0 })),
    setAbsolutePosition: vi.fn(),
    offsetX: vi.fn(),
  };

  const layers: { add: ReturnType<typeof vi.fn> }[] = [];

  function Stage(_opts: unknown) {
    return stage;
  }

  class Layer {
    add = vi.fn().mockReturnThis();
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
    this: { seatShape: unknown },
    opts: Record<string, unknown>,
  ) {
    eventSeatCalls.push(opts);
    const seatApi = {
      id: opts.id,
      booked: Boolean(opts.booked),
      unavailable: Boolean(opts.unavailable),
      isSelected: false,
      select: vi.fn(function select(this: { isSelected: boolean }) {
        this.isSelected = true;
      }),
      deselect: vi.fn(function deselect(this: { isSelected: boolean }) {
        this.isSelected = false;
      }),
    };

    const group = {
      on: vi.fn((eventName: string, handler: Handler) => {
        if (eventName === 'click tap') clickHandlers.push(handler);
      }),
      getAttr: vi.fn((key: string) => (key === 'seat' ? seatApi : undefined)),
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
    selectedNodes,
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

describe('Popcorn', () => {
  it('attaches the constructor to window for browser script usage', () => {
    expect(window.Popcorn).toBe(Popcorn);
  });

  beforeEach(() => {
    document.body.innerHTML = '';
    clickHandlers.length = 0;
    eventSeatCalls.length = 0;
    selectedNodes.length = 0;
    nodesById.clear();
    layers.length = 0;
    vi.clearAllMocks();
    stage.width.mockReturnValue(1000);
    stage.find.mockImplementation((selector: string) => {
      if (selector === '.selected') {
        return Object.assign([...selectedNodes], {
          toArray: () => [...selectedNodes],
        });
      }
      if (selector.startsWith('#')) {
        const node = nodesById.get(selector.slice(1));
        return Object.assign(node ? [node] : [], {
          toArray: () => (node ? [node] : []),
        });
      }
      return Object.assign([], { toArray: () => [] });
    });
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
    ).toThrow('No seatlist provided.');
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
    ).toThrow('Element not found.');
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

  it('skips background layer when backgroundColor is omitted', () => {
    mount({ backgroundColor: undefined });

    // front label, seat layout, legend — no dedicated background layer path asserted via Stage add count
    expect(stage.add.mock.calls.length).toBe(3);
  });

  it('registers listeners, redraws, and destroys the stage', () => {
    const { popcorn, elem } = mount();
    const handler = vi.fn();

    popcorn.on('popcorn.selectseat', handler);
    elem.dispatchEvent(
      new CustomEvent('popcorn.selectseat', { detail: { seatid: 'A1' } }),
    );
    expect(handler).toHaveBeenCalled();

    popcorn.redraw();
    expect(stage.draw).toHaveBeenCalled();

    popcorn.destroy();
    expect(stage.destroy).toHaveBeenCalled();
  });

  it('selects seats on click and emits select events', () => {
    const { popcorn } = mount();
    const selected: unknown[] = [];
    popcorn.on('popcorn.selectseat', (event) => {
      selected.push((event as CustomEvent).detail);
    });

    const group = nodesById.get('A1');
    clickHandlers[0]({
      target: { findAncestor: () => group },
    });

    expect(selected).toEqual([{ seatid: 'A1', total: 1 }]);
    expect(stage.draw).toHaveBeenCalled();
  });

  it('emits maxseats when the selection limit is reached', () => {
    const { popcorn } = mount({ maxSeats: 1 });
    const maxed: unknown[] = [];
    popcorn.on('popcorn.maxseats', (event) => {
      maxed.push((event as CustomEvent).detail);
    });

    selectedNodes.push({
      id: () => 'A2',
      getAttr: () => ({ isSelected: true }),
    });

    const group = nodesById.get('A1');
    clickHandlers[0]({
      target: { findAncestor: () => group },
    });

    expect(maxed).toEqual([{ total: 1 }]);
  });

  it('deselects an already selected seat on click', () => {
    const { popcorn, elem } = mount();
    const deselected: unknown[] = [];
    popcorn.on('popcorn.deselectseat', (event) => {
      deselected.push((event as CustomEvent).detail);
    });

    const seatApi = nodesById.get('A1')?.getAttr('seat') as {
      isSelected: boolean;
      deselect: ReturnType<typeof vi.fn>;
    };
    seatApi.isSelected = true;
    selectedNodes.push({
      id: () => 'A1',
      getAttr: () => seatApi,
    });

    clickHandlers[0]({
      target: { findAncestor: () => nodesById.get('A1') },
    });

    expect(seatApi.deselect).toHaveBeenCalled();
    expect(deselected).toEqual([{ seatid: 'A1', total: 0 }]);
    expect(elem).toBeTruthy();
  });

  it('ignores clicks on booked seats', () => {
    mount();
    const group = nodesById.get('A2');

    clickHandlers[1]({
      target: { findAncestor: () => group },
    });

    const seatApi = group?.getAttr('seat') as {
      select: ReturnType<typeof vi.fn>;
    };
    expect(seatApi.select).not.toHaveBeenCalled();
  });

  it('gets and sets the selected seat ids', () => {
    const { popcorn } = mount();
    const a1 = nodesById.get('A1')?.getAttr('seat') as {
      select: ReturnType<typeof vi.fn>;
      deselect: ReturnType<typeof vi.fn>;
    };
    const existing = {
      id: () => 'A2',
      getAttr: vi.fn(() => ({ deselect: vi.fn() })),
    };
    selectedNodes.push(existing);

    expect(popcorn.selected).toEqual(['A2']);

    popcorn.selected = ['A1'];
    expect(existing.getAttr).toHaveBeenCalledWith('seat');
    expect(a1.select).toHaveBeenCalled();
    expect(stage.draw).toHaveBeenCalled();
  });
});
