var alt = require('../../../../../../alt');
var helper = require('../../../../../../helper');
var ls = require('local-storage');
var volumeActions = require('./actions');

var VolumeStore = function() {

    function VolumeStore() {
        helper.classCallCheck(this, VolumeStore);
        this.bindActions(volumeActions);

        this.volume = ls.isSet('volume') ? ls('volume') : 100;
        this.muted = false;

    }

    helper.createClass(VolumeStore, [{
    key: 'onSettingChange',
    value: function 
    onSettingChange(setting) {
        this.setState(setting);
    }
    }]);
    return VolumeStore;

}

module.exports = alt.createStore(VolumeStore);
