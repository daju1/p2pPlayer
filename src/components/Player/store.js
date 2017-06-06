var alt = require('../../alt');

var playerActions = require('./actions');
var helper = require('../../helper');



var playerStore = function playerStore() {
    helper.classCallCheck(this, playerStore);
    this.bindActions(playerActions);
};
module.exports = alt.createStore(playerStore, 'playerStore');