var VisibilityActions = require('../components/Visibility/actions');
var PlayerStore = require('../store');
var SubtitleActions = require('../components/SubtitleText/actions');
var _ = require('lodash');
var player = require('./player');

module.exports = {
    
    toggleMenu: (arg) => {
        VisibilityActions.toggleMenu(arg);
    },
    
    defaultSettings: () => {

        var wcjs = player.wcjs;

        wcjs.audio.delay = 0;
        wcjs.subtitles.delay = 0;

        player.events.emit('subtitleUpdate');

        var playerState = player.fields;
        if (playerState.speed) {
            playerState.subDelay.value = '0 ms';
            playerState.audioDelay.value = '0 ms';
            playerState.audioChannel.value = 'Stereo';
            playerState.aspect.value = 'Default';
            playerState.crop.value = 'Default';
            playerState.zoom.value = 'Default';
        }
        player.set({
            aspect: 'Default',
            crop: 'Default',
            zoom: 1,
            audioDelay: 0,
            subDelay: 0
        });
    }
}
