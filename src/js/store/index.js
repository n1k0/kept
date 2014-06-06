"use strict";

function KeptStore(options) {
  options = options || {};
  this._store = options.store || localStorage;
}

KeptStore.prototype = {
  load: function() {
    var data = this._store.getItem("keep.data");
    if (!data) {
      console.error("empty stored kept data:", data);
      return [];
    }
    try {
      return JSON.parse(data) || [];
    } catch (e) {
      console.error("failed parsing kept data:", data, e);
      return [];
    }
  },

  save: function(data) {
    try {
      this._store["keep.data"] = JSON.stringify(data);
    } catch (e) {
      console.error("failed saving keep data", e);
    }
  }
};

module.exports = KeptStore;
