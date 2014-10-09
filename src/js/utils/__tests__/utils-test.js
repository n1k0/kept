"use strict";

jest.dontMock('..');
var utils = require('..');

describe("nextId", function() {

  it("should create an uuid", function() {
    expect(utils.nextId().length).toEqual(36);
  });
});


describe("objectEquals", function() {
  it("should test objects equality", function() {
    expect(utils.objectEquals(
      {b: "Toto", a: "Titi"}, {a: "Titi", b: "Toto"}
    )).toEqual(true);
  });
});
