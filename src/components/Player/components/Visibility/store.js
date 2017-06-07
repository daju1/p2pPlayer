var alt = require('../../../../alt');
var VisibilityActions = require('./actions');

class VisibilityStore {

    constructor() {
        this.bindActions(VisibilityActions);

        this.playlist = false;
        this.settings = false;
        this.subtitles = false;
        this.casting = false;
        this.uiShown = true;
        this.uiHidden = false;

    }

    onSettingChange(setting) {
        this.setState(setting);
    }

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

    onUiShown(toggle) {
        this.setState({
            uiShown: toggle
        });
    }

}

module.exports = alt.createStore(VisibilityStore);
