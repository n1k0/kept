"use strict";
var PREFIX = "keep_";  // Schema table prefix
var schema = require("../data/daybed_schema");
var objectEquals = require("../utils").objectEquals;
var Daybed = require("daybed.js");

console.log("Daybed", Daybed);

function DaybedStore(options) {
  if (!options.hasOwnProperty("host")) {
    throw new Error("Please define your Daybed storage host urls.");
  }
  this._types = Object.keys(schema);
  this._options = options;
}


DaybedStore.prototype = {
  setUp: function() {
    var self = this;
    return Daybed.startSession(self._options.host, {
      token: self._options.token
    }).then(function(session) {
      self._session = session;
      self._prefix = PREFIX + session.token.slice(0, 5);
      self._options.onSession(session);
      return self._session.getModels();
    }).then(function(models) {
      // Make sure all needed models are defined.
      var modelIds = [];
      models.forEach(function(doc) {
        modelIds.push(doc.id);
      });
      return Promise.all(self._types.map(function(type) {
        var daybedModelName = self._prefix + type;
        if (modelIds.indexOf(daybedModelName) === -1) {
          // If not create the model
          return self._session.addModel(daybedModelName, schema[type])
            .catch(function(err) {
              console.error("Add model", daybedModelName, ":", err);
              throw new Error("Add model " + daybedModelName + ": " + err);
            });
        } else {
          console.log("Model", daybedModelName, "already exists.");
        }
      }));
    });
  },
  load: function() {
    var self = this;
    var data = [];
    return Promise.all(self._types.map(function(type) {
      return self._session.getRecords(self._prefix + type)
        .then(function(doc) {
          data = data.concat(doc.records.map(function(record) {
            record.type = type;
            return record;
          }));
        })
        .catch(console.error);
    }))
      .then(function() {
        return data;
      });
  },

  save: function(data) {
    console.log(data);
    var self = this;
    var currentDataObj = {},
        previousDataObj = {},
        currentDataIds, previousDataIds,
        droppedObjIds, changedObjIds;

    return self.load()
      .then(function(items) {
        console.log(items);
        // Get current data ids
        currentDataIds = data.map(function(doc) {
          currentDataObj[doc.id] = doc;
          return doc.id;
        });

        previousDataIds = items.map(function(doc) {
          previousDataObj[doc.id] = doc;
          return doc.id;
        });

        // Get deleted objects
        droppedObjIds = previousDataIds.filter(function(docId) {
          return currentDataIds.indexOf(docId) < 0;
        });

        // Get changed objects
        changedObjIds = currentDataIds.filter(function(docId) {
          console.log(docId, currentDataObj[docId], previousDataObj[docId],
                      objectEquals(currentDataObj[docId], previousDataObj[docId]));
          return objectEquals(currentDataObj[docId], previousDataObj[docId]) !== true;
        });

        // Make the change to the backend
        return Promise.all(changedObjIds.map(function(docId) {
          var doc = currentDataObj[docId];
          var daybedModelName;
          try {
            doc = JSON.parse(JSON.stringify(doc));
            daybedModelName = self._prefix + doc.type;
            delete doc.type;
          } catch (e) {
            console.error(doc, "failed saving keep data", e);
            return;
          }
          return self._session.addRecord(daybedModelName, doc)
            .catch(console.error);
        })).then(function() {
          return Promise.all(droppedObjIds.map(function(docId) {
            var doc = previousDataObj[docId];
            var daybedModelName = self._prefix + doc.type;
            return self._session.deleteRecord(daybedModelName, docId)
              .catch(console.error);
          }));
        });
      });
  }
};

module.exports = DaybedStore;
