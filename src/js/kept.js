/** @jsx React.DOM */

"use strict";

var React = require("react");
var KeptApp = require("./components/KeptApp");
var KeptStore = require("./store");
var DaybedStore = require("./store/daybed");
// var store = new KeptStore();
var store = new DaybedStore({
  "host": "http://localhost:8000",
  "tokenId": "36e568b4816127c255ecc0263cb03b6b57ff504ae344702d869ee5561eba9750",
  "tokenKey": "b81c8fea3f356039d12abd9704d449f1d4dfb78c4262301cadc5e626d5a8b3e0"
});

React.renderComponent(<KeptApp store={store} />,
                      document.getElementById('kept'));
