var alt = require('../../alt');

var playerActions = require('./actions');

class playerStore {
    constructor() {
        this.bindActions(playerActions);
    }
}

module.exports = alt.createStore(playerStore, 'playerStore');