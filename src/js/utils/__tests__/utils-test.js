"use strict";

jest.dontMock('..');
var utils = require('..');

describe("nextId", function() {
  var items;

  beforeEach(function() {
    items = [{id: 1}];
  });

  it("should create a next id if items list is empty", function() {
    expect(utils.nextId([])).toEqual(1);
  });

  it("should find the next available id", function() {
    expect(utils.nextId(items)).toEqual(2);
  });
});

describe("range", function(){
  it("should return an array of given lenght", function() {
    var array = utils.range(5);
    expect(array.length).toBe(5);
  });

  it("should return an array where values equal index", function() {
    var array = utils.range(3);
    expect(array).toEqual([0,1,2]);
  });
});

describe("permut", function(){
  var original = [1,2,3];

  it("should not modify the orinal array", function() {
    var array = utils.permut(original, 1, 2);
    expect(array).not.toEqual(original);
  });

  it("should permut 2 elements in an array", function() {
    var array = utils.permut(original, 1, 2);
    expect(array[1]).toEqual(original[2]);
    expect(array[2]).toEqual(original[1]);
  });

});

