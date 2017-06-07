var alt = require('../../../../alt');
var helper = require('../../../../helper');

var controlActions = require('./actions');

var ControlStore = function() {

    function ControlStore() {
        helper.classCallCheck(this, ControlStore);
        this.bindActions(controlActions);

        this.foundSubs = false;
        this.fullscreen = false;

    }

    helper.createClass(ControlStore, [{
    key: 'onSettingChange',
    value: function 
    onSettingChange(setting) {
        this.setState(setting);
    }
    }]);
    return ControlStore;

}();

module.exports = alt.createStore(ControlStore);
