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
