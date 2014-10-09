"use strict";

function clone(o) {
  return JSON.parse(JSON.stringify(o));
}
exports.clone = clone;


function objectEquals(x, y) {
  // if both x and y are null or undefined and exactly the same
  if (x === y) return true;

  // if they are not strictly equal, they both need to be Objects
  if (!(x instanceof Object) || !(y instanceof Object)) return false;

  // they must have the exact same prototype chain, the closest we can
  // do is test there constructor.
  if (x.constructor !== y.constructor) return false;

  for (var p in x) {
    // other properties were tested using x.constructor === y.constructor
    if (!x.hasOwnProperty(p)) continue;

    // allows to compare x[p] and y[p] when set to undefined
    if (!y.hasOwnProperty(p)) return false;

    // if they have the same strict value or identity then they are equal
    if (x[p] === y[p]) continue;

    if (typeof(x[p]) !== "object") return false;
      // Numbers, Strings, Functions, Booleans must be strictly equal

    // Objects and Arrays must be tested recursively
    if (!objectEquals(x[p], y[p])) return false;
  }

  for (p in y) {
    // allows x[p] to be set to undefined
    if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) return false;
  }
  return true;
}

exports.objectEquals = objectEquals;


// UUID management
function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
             .toString(16)
             .substring(1);
}

function nextId() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
         s4() + '-' + s4() + s4() + s4();
}
exports.nextId = nextId;
