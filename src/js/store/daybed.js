"use strict";
var PREFIX = "keep_";  // Schema table prefix
var schema = require("../data/daybed_schema");


function DaybedStore(options) {
  if (!options.hasOwnProperty("host")) {
    throw new Error("Please define your Daybed storage host urls.");
  }
  if (!options.hasOwnProperty("tokenId") ||
      !options.hasOwnProperty("tokenKey")) {
    throw new Error("Please define your Daybed credentials " +
                    "(tokenId, tokenKey).");
  }
  this._types = Object.keys(schema);
  
  this._store = new Daybed.Session(options.host, {
    id: options.tokenId,
    key: options.tokenKey,
    algorithm: "sha256"
  });
}


DaybedStore.prototype = {
  setUp: function() {
    return this._store.getModels()
      .then(function(models) {
        // Make sure all needed models are defined.
        var modelIds = [];
        models.forEach(function(doc) {
          modelIds.push(doc.id);
        });
        return Promise.all(this._types.map(function(type) {
          var daybedModelName = PREFIX + type;
          if (modelIds.indexOf(daybedModelName) === -1) {
            // If not create the model
            return this._store.addModel(daybedModelName, schema[type])
              .catch(function(err) {
                console.error("Add model", daybedModelName, ":", err);
                throw new Error("Add model " + daybedModelName + ": " + err);
              });
          } else {
            console.log("Model", daybedModelName, "already exists.");
          }
        }.bind(this)));
      }.bind(this));
  },
  load: function() {
    var data = [];
    return Promise.all(this._types.map(function(type) {
      return this._store.getRecords(PREFIX + type)
        .then(function(doc) {
          for (var i = 0; i < doc.records.length; i++) {
            var record = doc.records[i];
            record.type = type;
            data.push(record);
          }
        })
        .catch(console.error);
    }.bind(this))).then(function() {
      return data;
    });
  },

  save: function(data) {
    return Promise.all(data.map(function(doc) {
      try {
        doc = JSON.parse(JSON.stringify(doc));
      } catch (e) {
        console.error(doc, "failed saving keep data", e);
        return;
      }
      var daybedModelName = PREFIX + doc.type;
      delete doc.type;
      return this._store.addRecord(daybedModelName, doc)
        .catch(console.error);
    }.bind(this)));
  }
};

module.exports = DaybedStore;
