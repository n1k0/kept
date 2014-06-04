"use strict";

function clone(o) {
  return JSON.parse(JSON.stringify(o));
}
exports.clone = clone;

function nextId(items) {
  return Math.max.apply(null, items.concat([0]).map(function(item) {
    return item.id || 0;
  })) + 1;
}
exports.nextId = nextId;
