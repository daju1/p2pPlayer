var alt = require('../../../../alt');
var controlActions = require('./actions');

class ControlStore {

    constructor() {
        this.bindActions(controlActions);

        this.foundSubs = false;
        this.fullscreen = false;

    }

    onSettingChange(setting) {
        this.setState(setting);
    }

}

module.exports = alt.createStore(ControlStore);
