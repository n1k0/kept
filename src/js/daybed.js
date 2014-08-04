/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function(exports) {

  "use strict";

  var TIMEOUT = 15000;

  function request(options) {
    return new Promise(function(resolve, reject) {
      var req = new XMLHttpRequest();
      req.open(options.method, options.url, true);
      req.setRequestHeader('Content-Type', 'application/json');
      req.setRequestHeader('Accept', 'application/json');
      req.responseType = 'json';
      req.timeout = TIMEOUT;
      // req.withCredentials = true;

      if (options.validateOnly) {
        req.setRequestHeader('Validate-Only', 'true');
      }

      if (options.credentials) {
        var hawkHeader = hawk.client.header(options.url, options.method, {
          credentials: options.credentials
        });
        req.setRequestHeader('authorization', hawkHeader.field);
      }
      req.onload = function() {
        if (!("" + req.status).match(/^2/)) {
          reject(req.response);
          return;
        }
        resolve(req.response);
      };

      req.onerror = req.ontimeout = function(event) {
        reject(event.target.status);
      };

      var body;
      if (options.body) {
        body = JSON.stringify(options.body);
      }
      
      req.send(body);
    });
  }

  function getToken(daybedUrl) {
    return request({
      method: "POST",
      url: daybedUrl + "/tokens"
    });
  }

  function availableFields(host) {
    return request({
      method: "GET",
      url: host + "/fields"
    });
  }

  function spore(host) {
    return request({
      method: "GET",
      url: host + "/spore"
    });
  }


  function Session(host, credentials, options) {
    if (host === undefined) {
      throw new Error("You should provide an host.");
    }

    if (credentials === undefined ||
        !credentials.hasOwnProperty("id") || credentials.id === undefined ||
        !credentials.hasOwnProperty("key") || credentials.key === undefined) {
      credentials = undefined;
    }

    this.host = host;
    this.credentials = credentials;
    this.credentials.algorithm = "sha256";
    this.options = options;
  }

  Session.prototype = {
    hello: function() {
      return request({
        method: "GET",
        url: this.host + "/",
        credentials: this.credentials
      });
    },

    getModels: function() {
      return request({
        method: "GET",
        url: this.host + "/models",
        credentials: this.credentials
      });
    },

    addModel: function(modelname, definition, records) {
      var url, method;

      if (modelname === undefined) {
        method = "POST";
        url = this.host + "/models";
      } else {
        method = "PUT";
        url = this.host + "/models/" + modelname;
      }

      return request({
        method: method,
        url: url,
        body: {definition: definition, records: records},
        credentials: this.credentials
      });
    },

    getModel: function(modelname) {
      return request({
        method: "GET",
        url: this.host + "/models/" + modelname,
        credentials: this.credentials
      });
    },

    deleteModel: function(modelname) {
      return request({
        method: "DELETE",
        url: this.host + "/models/" + modelname,
        credentials: this.credentials
      });
    },

    getDefinition: function(modelname) {
      return request({
        method: "GET",
        url: this.host + "/models/" + modelname + "/definition",
        credentials: this.credentials
      });
    },

    getPermissions: function(modelname) {
      return request({
        method: "GET",
        url: this.host + "/models/" + modelname + "/permissions",
        credentials: this.credentials
      });
    },

    putPermissions: function(modelname, permissions) {
      return request({
        method: "PUT",
        url: this.host + "/models/" + modelname + "/permissions",
        body: permissions,
        credentials: this.credentials
      });
    },

    patchPermissions: function(modelname, rules) {
      return request({
        method: "PATCH",
        url: this.host + "/models/" + modelname + "/permissions",
        body: rules,
        credentials: this.credentials
      });
    },

    getRecords: function(modelname) {
      return request({
        method: "GET",
        url: this.host + "/models/" + modelname + "/records",
        credentials: this.credentials
      });
    },

    deleteRecords: function(modelname) {
      return request({
        method: "DELETE",
        url: this.host + "/models/" + modelname + "/records",
        credentials: this.credentials
      });
    },

    getRecord: function(modelname, recordId) {
      return request({
        method: "GET",
        url: this.host + "/models/" + modelname + "/records/" + recordId,
        credentials: this.credentials
      });
    },

    addRecord: function(modelname, record) {
      var url, method;

      if (!record.hasOwnProperty("id") || !record.id) {
        method = "POST";
        url = this.host + "/models/" + modelname + "/records";
      } else {
        method = "PUT";
        url = this.host + "/models/" + modelname + "/records/" + record.id;
      }

      return request({
        method: method,
        url: url,
        body: record,
        credentials: this.credentials
      });
    },

    validateRecord: function(modelname, record) {
      var url, method;

      if (!record.hasOwnProperty("id")) {
        method = "POST";
        url = this.host + "/models/" + modelname + "/records";
      } else {
        method = "PUT";
        url = this.host + "/models/" + modelname + "/records/" + record.id;
      }

      return request({
        method: method,
        url: url,
        body: record,
        validateOnly: true,
        credentials: this.credentials
      });
    },

    patchRecord: function(modelname, recordId, patch) {
      return request({
        method: "PATCH",
        url: this.host + "/models/" + modelname + "/records/" + recordId,
        body: patch,
        credentials: this.credentials
      });
    },

    deleteRecord: function(modelname, recordId) {
      return request({
        method: "DELETE",
        url: this.host + "/models/" + modelname + "/records/" + recordId,
        credentials: this.credentials
      });
    }
  };


  function Model(session, modelname, definition, records) {
    this.session = session;
    this.modelname = modelname;

    this._definition = definition;
    this._records = records || [];
  }

  Model.prototype = {
    load: function() {
      var self = this;
      return new Promise(function(resolve, reject) {
        self.session.getModel(self.modelname).then(function(resp) {
          console.debug(self._definition, "has been replaced by", resp.definition);
          console.debug(self._records, "has been replaced by", resp.records);

          self._definition = resp.definition;
          self._records = resp.records;
          resolve();
        }).catch(reject);
      });
    },
    add: function(record) {
      this._records.push(record);
    },
    definition: function() {
      return this._definition;
    },
    records: function() {
      return this._records;
    },
    save: function() {
      return this.session.addModel(this.modelname, this._definition, this._records);
    },
    delete: function() {
      return this.session.deleteModel(this.modelname);
    }
  };


  var Daybed = {
    getToken: getToken,
    availableFields: availableFields,
    spore: spore,
    Session: Session,
    Model: Model
  };

  exports.Daybed = Daybed;

})(this);
