var alt = require('../../../../../../alt');
var helper = require('../../../../../../helper');
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

var TimeStore = function() {

    function TimeStore() {
        helper.classCallCheck(this, TimeStore);
        this.bindActions(timeActions);

        this.currentTime = '00:00';
        this.totalTime = '00:00';
        this.length = 0;
        this.forceTime = false;
        this.overTime = false;

    }
    helper.createClass(TimeStore, [{

    key: 'onSettingChange',
    value: function 
    onSettingChange(setting) {
        this.setState(setting);
    }

    }, {
    key: 'onTime',
    value: function 
    onTime(time) {
        this.setState({
            currentTime: handleTime(time, this.length)
        });
    }

    }, {
    key: 'onLength',
    value: function 
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
    }]);
    return TimeStore;

}();

module.exports = alt.createStore(TimeStore);
