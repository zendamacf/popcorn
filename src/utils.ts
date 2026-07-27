import type { Node } from 'konva/lib/Node';

/**
 * Get spreadsheet-style row label, e.g. A-Z, then AA, AB, etc.
 * @param {number} rowNumber The row number.
 */
const rowLabel = (rowNumber: number): string => {
  let temp: number;
  let letter = '';
  while (rowNumber > 0) {
    // 65 - 90 is A - Z
    temp = (rowNumber - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    rowNumber = (rowNumber - temp - 1) / 26;
  }
  return letter;
};

/**
 * Make a shallow copy of an array.
 * @param {Array} array The array to copy.
 */
const cloneArray = <T>(array: T[]): T[] => {
  return [...array];
};

/**
 * Convert a 1D array into a 2D array.
 * @param {Array} array The 1D array to convert.
 * @param {number} maxLength The maximum length of the second dimension arrays.
 */
const multiArray = <T>(array: T[], maxLength: number): T[][] => {
  const multi: T[][] = [];
  while (array.length) multi.push(array.splice(0, maxLength));

  return multi;
};

/**
 * Horizontally center a Konva node in it's parent.
 * @param {Konva.Node} node The Node to center.
 * @param {Konva.Node} parent The parent Node to be centered inside of.
 */
const centerKonvaNode = (node: Node, parent: Node): void => {
  const { y } = node.absolutePosition();
  node.absolutePosition({ x: parent.width() / 2, y: y });
  node.offsetX(node.width() / 2);
};

export { centerKonvaNode, cloneArray, multiArray, rowLabel };
