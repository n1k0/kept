"use strict";

var utils = require("../utils");
var React = require("react");
var KeptColumns = require("./KeptColumns");
var DefaultContent = require("./DefaultContent");
var Resize = require("../mixins/Resize");

var KeepItems = React.createClass({
  mixins:[Resize],

  getInitialState: function() {
    return {
      columns: 1,
      columnsWidth: 300
    };
  },

  onResize: function(event){
    var col = 1;
    if (this.state.columnsWidth > 0) {
      col = Math.floor(event.target.innerWidth / this.state.columnsWidth);
    }

    this.setState({columns: col});
  },

  render: function() {
    if (!this.props.items.length) {
      return (
        <DefaultContent newItem={this.props.newItem}
                        loadSamples={this.props.loadSamples} />
      );
    }

    return (
      <div className="kept-list">
      {
        utils
          .range(this.state.columns)
          .map(function(_, index) {
            var colItems = this.props.items.filter(function(item, i) {
              return i % this.state.columns === index;
            }, this);

            return (
              <KeptColumns items={colItems}
                           key={index}
                           column={index}
                           columns={this.state.columns}
                           edit={this.props.edit}
                           remove={this.props.remove}
                           update={this.props.update}
                           move={this.props.move} />
            );
          }, this)
      }
      </div>
    );
  }
});

module.exports = KeepItems;
