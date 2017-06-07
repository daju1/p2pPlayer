var alt = require('../../../../../../alt'
var SubtitleActions = require('../../../SubtitleText/actions');
var {handleTime} = require('../../../../utils/time');
var ls = require('local-storage');

class TimeActions {

    constructor() {
        this.generateActions(
            'settingChange',
            'time',
            'length'
        );
    }
    
    pushTime(time) {
        var visibilityState = this.alt.stores.VisibilityStore.state;
        if (ls('renderHidden') || ((visibilityState.uiShown && !visibilityState.uiHidden) || (visibilityState.playlist || visibilityState.settings))) {
            var timeState = this.alt.stores.TimeStore.state;
            var newTime = handleTime(time, timeState.length);
            if (newTime != timeState.currentTime)
                this.actions.time(time);
        }

        SubtitleActions.time(time); // print subtitle text if a subtitle is selected
    }

}


module.exports = alt.createActions(TimeActions);
