var alt = require('../../../../../../alt'
var _ = require('lodash');
var ls = require('local-storage');
var {handleTime} = require('../../../../utils/time');
var timeActions = require('./actions');
var PlayerStore = require('../../../../store');
var PlayerActions = require('../../../../actions');
var VisibilityStore = require('../../../Visibility/store');
var VisibilityActions = require('../../../Visibility/actions');
var traktUtil = require('../../../../utils/trakt');
var player = require('../../../../utils/player');

var throttlers = {
    scrobbleKeys: false
};

class TimeStore {

    constructor() {
        this.bindActions(timeActions);

        this.currentTime = '00:00';
        this.totalTime = '00:00';
        this.length = 0;
        this.forceTime = false;
        this.overTime = false;

    }

    onSettingChange(setting) {
        this.setState(setting);
    }

    onTime(time) {
        this.setState({
            currentTime: handleTime(time, this.length)
        });
    }

    onLength(length) {

        if (ls('speedPulsing') && ls('speedPulsing') == 'enabled')
            _.defer(PlayerActions.pulse);

        _.defer(() => {
            this.setState({
                length: length,
                totalTime: handleTime(length, length)
            });
        });
    }

}

module.exports = alt.createStore(TimeStore);
