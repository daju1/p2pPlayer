var alt = require('../../../../alt');
var helper = require('../../../../helper');
var subUtil = require('../../utils/subtitles');
var SubtitleActions = require('./actions');
var PlayerStore = require('../../store');

var SubtitleStore = function() {

    function SubtitleStore() {
        helper.classCallCheck(this, SubtitleStore);
        this.bindActions(SubtitleActions);

        this.subtitle = [];
        this.text = '';
        this.size = 21.3;
        this.marginBottom = '70px';
        this.selectedSub = 1;
        this.trackSub = -1;

    }

    helper.createClass(SubtitleStore, [{
    key: 'onSettingChange',
    value: function 
    onSettingChange(setting) {
        this.setState(setting);
    }
    }]);
    return SubtitleStore;

}

module.exports = alt.createStore(SubtitleStore);
