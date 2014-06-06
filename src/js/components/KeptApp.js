/** @jsx React.DOM */

"use strict";

var utils = require("../utils");
var React = require("react");
var KeptStore = require("../store");
var UndoStack = require("../mixins/UndoStack");
var KeptTextForm = require("./KeptTextForm");
var KeptTodoForm = require("./KeptTodoForm");
var KeptMenuBar = require("./KeptMenuBar");
var KeptItems = require("./KeptItems");
var initial = require("../data/initial");

var KeptApp = React.createClass({
  mixins: [UndoStack],

  store: new KeptStore(),

  getInitialState: function() {
    return {
      items: this.store.load()
    };
  },

  /**
   * Provided for the UndoStack mixin.
   */
  getStateSnapshot: function() {
    return {items: this.state.items};
  },

  /**
   * Provided for the UndoStack mixin.
   */
  setStateSnapshot: function(snapshot) {
    this.setState(snapshot);
  },

  _forms: {
    // XXX: use standard component constructor?
    text: function(data) {
      return (
        <KeptTextForm resetForm={this.resetForm}
                      create={this.create}
                      update={this.update}
                      data={data} />
      );
    },

    todo: function(data) {
      return (
        <KeptTodoForm resetForm={this.resetForm}
                      create={this.create}
                      update={this.update}
                      data={data} />
      );
    }
  },

  save: function(items) {
    this.store.save(items);
    this.snapshot();
    this.setState({items: items});
  },

  loadSamples: function() {
    this.save(initial);
  },

  formCreator: function(type) {
    return function(data) {
      this.setState({form: this._forms[type].call(this, data)});
    }.bind(this);
  },

  newItem: function(type) {
    return this.formCreator(type).bind(null, {});
  },

  resetForm: function() {
    this.setState({form: null});
  },

  create: function(itemData) {
    itemData.id = utils.nextId(this.state.items);
    this.save(this.state.items.concat([itemData]));
    this.resetForm();
  },

  edit: function(itemData) {
    this.formCreator(itemData.type)(itemData);
  },

  update: function(updatedItem) {
    this.save(this.state.items.map(function(item) {
      if (item.id === updatedItem.id)
        return updatedItem;
      return item;
    }));
    this.resetForm();
  },

  remove: function(itemData) {
    this.save(this.state.items.filter(function(data) {
      return itemData !== data;
    }));
  },

  move: function(fromIndex, toIndex) {
    var items = this.state.items.slice(0);
    items.splice(toIndex, 0, items.splice(fromIndex, 1)[0]);
    this.save(items);
  },

  render: function() {
    return (
      <div>
        <KeptMenuBar newItem={this.newItem}
                     loadSamples={this.loadSamples}
                     undo={this.undo}
                     redo={this.redo} />
        {this.state.form}
        <KeptItems items={this.state.items}
                   newItem={this.newItem}
                   loadSamples={this.loadSamples}
                   edit={this.edit}
                   update={this.update}
                   remove={this.remove}
                   move={this.move} />
      </div>
    );
  }
});

module.exports = KeptApp;
