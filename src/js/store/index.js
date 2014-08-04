"use strict";

function KeptStore(options) {
  options = options || {};
  this._store = options.store || localStorage;
}

KeptStore.prototype = {
  load: function() {
    return new Promise(function(resolve, reject) {
      var data = this._store.getItem("keep.data");
      if (!data) {
        console.error("empty stored kept data:", data);
        resolve([]);
      }
      try {
        resolve(JSON.parse(data) || []);
      } catch (e) {
        console.error("failed parsing kept data:", data, e);
        resolve([]);
      }
    });
  },

  save: function(data) {
    return new Promise(function(resolve, reject) {
      try {
        this._store["keep.data"] = JSON.stringify(data);
      } catch (e) {
        console.error("failed saving keep data", e);
      }
      resolve();
    });
  }
};

module.exports = KeptStore;
