"use strict";

var expect = require("chai").expect;

var utils = require("../index.js");


describe("nextId", function() {
  var items;

  beforeEach(function() {
    items = [{id: 1}];
  });

  it("should create a next id if items list is empty", function() {
    expect(utils.nextId([])).to.equal(1);
  });

  it("should find the next available id", function() {
    expect(utils.nextId(items)).to.equal(2);
  });
});

describe("range", function(){
  it("should return an array of given lenght", function() {
    var array = utils.range(5);
    expect(array.length).to.equal(5);
  });

  it("should return an array where values equal index", function() {
    var array = utils.range(3);
    expect(array).to.eql([0,1,2]);
  });
});

describe("permut", function(){
  var original = [1,2,3];

  it("should not modify the orinal array", function() {
    var array = utils.permut(original, 1, 2);
    expect(array).not.to.equal(original);
  });

  it("should permut 2 elements in an array", function() {
    var array = utils.permut(original, 1, 2);
    expect(array[1]).to.equal(original[2]);
    expect(array[2]).to.equal(original[1]);
  });

});

