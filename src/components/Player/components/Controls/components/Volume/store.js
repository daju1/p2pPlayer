var alt = require('../../../../../../alt');
var ls = require('local-storage');
var volumeActions = require('./actions');

class VolumeStore {

    constructor() {
        this.bindActions(volumeActions);

        this.volume = ls.isSet('volume') ? ls('volume') : 100;
        this.muted = false;

    }

    onSettingChange(setting) {
        this.setState(setting);
    }

}

module.exports = alt.createStore(VolumeStore);
