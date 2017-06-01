var alt = require('../alt');
var historyActions = require('../actions/historyActions');


class historyStore {
    constructor() {
        this.bindActions(historyActions);

        this.history = false;
    }

    onHistory(history) {
        this.setState({
            history: history
        });
    }


}

module.exports = alt.createStore(historyStore);