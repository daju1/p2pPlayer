var alt = require('../../../../alt');
var subUtil = require('../../utils/subtitles');
var SubtitleActions = require('./actions');
var PlayerStore = require('../../store');

class SubtitleStore {

    constructor() {
        this.bindActions(SubtitleActions);

        this.subtitle = [];
        this.text = '';
        this.size = 21.3;
        this.marginBottom = '70px';
        this.selectedSub = 1;
        this.trackSub = -1;

    }

    onSettingChange(setting) {
        this.setState(setting);
    }

}

module.exports = alt.createStore(SubtitleStore);
