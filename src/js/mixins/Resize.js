"use strict";

var Resize = {
  componentDidMount: function() {
    // checking if we are inside a browser
    if (!window) {
      return;
    }

    window.addEventListener('resize', this._onResize);
    this._onResize({target:window});
  },

  componentWillUnmount: function() {
    // checking if we are inside a browser
    if (!window) {
      return;
    }

    window.removeEventListener('resize', this._onResize);
  },

  _onResize: function(event){
    if (typeof this.onResize !== "function") return;
    this.onResize(event);
  }
};

module.exports = Resize;
