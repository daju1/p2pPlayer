var alt = require('../alt');

class localActions {

    constructor() {
        this.generateActions(
            'stream'
        );
    }

    stream(file) {
        this.dispatch();
    }

    host(file) {
        this.dispatch();

    }
}

module.exports = alt.createActions(localActions);