var alt = require('../../../../alt');
var helper = require('../../../../helper');
var VisibilityActions = require('./actions');

var VisibilityStore = function() {

    function VisibilityStore() {
        helper.classCallCheck(this, VisibilityStore);
        this.bindActions(VisibilityActions);

        this.playlist = false;
        this.settings = false;
        this.subtitles = false;
        this.casting = false;
        this.uiShown = true;
        this.uiHidden = false;

    }

    helper.createClass(VisibilityStore, [{
    key: 'onSettingChange',
    value: function 
    onSettingChange(setting) {
        this.setState(setting);
    }

    }, {
    key: 'onToggleMenu',
    value: function 
    onToggleMenu(menu) {
        var obj = {
            playlist: false,
            settings: false,
            casting: false,
            subtitles: false
        };
        obj[menu] = !this[menu];
        this.setState(obj);
    }

    }, {
    key: 'onUiShown',
    value: function 
    onUiShown(toggle) {
        this.setState({
            uiShown: toggle
        });
    }
    }]);
    return VisibilityStore;

}

module.exports = alt.createStore(VisibilityStore);
