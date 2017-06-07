var alt = require('../../../../alt');
var helper = require('../../../../helper');
var _ = require('lodash');
var ls = require('local-storage');
var {
    ipcRenderer
}
= require('electron');
var player = require('../../utils/player');

var ControlActions = function() {

    function ControlActions() {
        helper.classCallCheck(this, ControlActions);
        this.generateActions(
            'settingChange'
        );
    }

    helper.createClass(ControlActions, [{
    key: 'handlePausePlay',
    value: function 
    handlePausePlay() {
        if (player.wcjs.state == 6) {
            // if playback ended, restart last item
            player.playItem( player.wcjs.playlist.itemCount - 1 , true );
        } else {
            player.wcjs.togglePause();
        }
    }

    }, {
    key: 'toggleFullscreen',
    value: function 
    toggleFullscreen(state) {
        if (typeof state !== 'boolean') state = !this.alt.stores.ControlStore.state.fullscreen;

        var canvasEffect = window.document.querySelector(".render-holder > div:first-of-type");

        if (canvasEffect) {
            canvasEffect.style.display = 'none';
            _.delay(() => {
                canvasEffect.style.display = 'block';
            }, 500);
        }

        ipcRenderer.send('app:fullscreen', state);
        this.actions.settingChange({
            fullscreen: state
        });
    }
    }]);
    return ControlActions;

}


module.exports = alt.createActions(ControlActions);
