var alt = require('../../alt');
var HeaderActions = require('./actions');
var engineStore = require('../../stores/engineStore');

class HeaderStore {
    constructor() {
        this.bindActions(HeaderActions);

        this.maximized = false;
        this.minimized = false;
    }

    onMaximized(toggle) {
        this.setState({
            maximized: toggle,
        });
    }

    onMinimized(toggle) {
        this.setState({
            minimized: toggle,
        });
    }
    
}

module.exports = alt.createStore(HeaderStore);