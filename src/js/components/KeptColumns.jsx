"use strict";

var React = require("react");
var KeptEntry = require("./KeptEntry");

var KeptColumns = React.createClass({
  render: function() {
    return (
      <div className="kept-columns">{
        this.props.items.map(function(itemData, index) {

          var key = index * this.props.columns + this.props.column;

          return <KeptEntry key={key}
                            itemIndex={key}
                            itemData={itemData}
                            edit={this.props.edit}
                            remove={this.props.remove}
                            update={this.props.update}
                            move={this.props.move} />;
        }.bind(this))
      }</div>
    );
  }
});

module.exports = KeptColumns;
