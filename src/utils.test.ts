import { describe, expect, it, vi } from 'vitest';
import { centerKonvaNode, cloneArray, multiArray, rowLabel } from './utils';

describe('rowLabel', () => {
  it('maps 1–26 to A–Z', () => {
    expect(rowLabel(1)).toBe('A');
    expect(rowLabel(26)).toBe('Z');
  });

  it('maps values above 26 to multi-letter labels', () => {
    expect(rowLabel(27)).toBe('AA');
    expect(rowLabel(28)).toBe('AB');
    expect(rowLabel(52)).toBe('AZ');
  });

  it('returns an empty string for non-positive input', () => {
    expect(rowLabel(0)).toBe('');
  });
});

describe('cloneArray', () => {
  it('returns a shallow copy', () => {
    const original = [{ id: 'A1' }, { id: 'A2' }];
    const cloned = cloneArray(original);

    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
    expect(cloned[0]).toBe(original[0]);
  });
});

describe('multiArray', () => {
  it('chunks a flat array into rows of the given length', () => {
    const input = [1, 2, 3, 4, 5];
    expect(multiArray([...input], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('does not mutate the source array', () => {
    const input = [1, 2, 3];
    expect(multiArray(input, 2)).toEqual([[1, 2], [3]]);
    expect(input).toEqual([1, 2, 3]);
  });

  it('rejects non-positive chunk sizes', () => {
    expect(() => multiArray([1], 0)).toThrow(/maxLength must be >= 1/);
  });
});

describe('centerKonvaNode', () => {
  it('centers the node horizontally within the parent', () => {
    const node = {
      getAbsolutePosition: vi.fn(() => ({ x: 10, y: 20 })),
      setAbsolutePosition: vi.fn(),
      offsetX: vi.fn(),
      width: vi.fn(() => 40),
    };
    const parent = {
      width: vi.fn(() => 200),
    };

    centerKonvaNode(node as never, parent as never);

    expect(node.setAbsolutePosition).toHaveBeenCalledWith({ x: 100, y: 20 });
    expect(node.offsetX).toHaveBeenCalledWith(20);
  });
});
