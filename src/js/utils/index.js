"use strict";

/**
 * deep clone an object
 * @param  {Object} o
 * @return {Object}
 */
function clone(o) {
  return JSON.parse(JSON.stringify(o));
}
exports.clone = clone;

/**
 * return the bigger id value contained in the array + 1
 * @param  {Array} items
 * @return {int}
 */
function nextId(items) {
  return Math.max.apply(null, items.concat([0]).map(function(item) {
    return item.id || 0;
  })) + 1;
}
exports.nextId = nextId;

/**
 * Return an array of the given length
 * @param  {int}    n
 * @return {Array}
 */
function range(n) {
  return Array.apply(0, Array(n)).map(function(_, i) { return i; });
}
exports.range = range;

/**
 * clamp a value between a min and a max
 * @param  {int} value
 * @param  {int} minValue
 * @param  {int} maxValue
 * @return {int}
 */
function clamp(value, minValue, maxValue) {
  return Math.min(Math.max(minValue, value), maxValue);
}
exports.clamp = clamp;

/**
 * Permut 2 items in an array and return a fresh array.
 * @param  {Array}  array
 * @param  {int}    fromIndex
 * @param  {int}    toIndex
 * @return {Array}
 */
function permut(array, fromIndex, toIndex) {
  var ar = array.slice(0);
  if (fromIndex === toIndex) {
    return;
  }

  fromIndex = clamp(fromIndex, 0, array.length);
  toIndex   = clamp(toIndex, 0, array.length);

  var item = ar[fromIndex];
  ar[fromIndex] = ar[toIndex];
  ar[toIndex] = item;

  return ar;
}
exports.permut = permut;

