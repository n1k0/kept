/** @jsx React.DOM */

var React = require("react");
var KeptEntry = require("./KeptEntry");

var KeepItems = React.createClass({
  render: function() {
    if (!this.props.items.length) {
      return <DefaultContent newItem={this.props.newItem}
                             loadSamples={this.props.loadSamples} />;
    }
    return (
      <div className="kept-list">{
        this.props.items.map(function(itemData, key) {
          return <KeptEntry key={key} itemData={itemData}
                    edit={this.props.edit}
                    remove={this.props.remove}
                    update={this.props.update}
                    move={this.props.move} />
        }.bind(this))
      }</div>
    );
  }
});

module.exports = KeepItems;
