var alt = require('../../../../alt');
var helper = require('../../../../helper');
var PlayerStore = require('../../store');
var PlayerActions = require('../../actions');
var ControlActions = require('../Controls/actions');
var subUtil = require('../../utils/subtitles');
var ls = require('local-storage');
var _ = require('lodash');
var player = require('../../utils/player');

var SubtitleActions = function() {

    function SubtitleActions() {
        helper.classCallCheck(this, SubtitleActions);
        this.generateActions(
            'settingChange'
        );
    }


    helper.createClass(SubtitleActions, [{
    key: 'time',
    value: function 
    time(time) {
        // print subtitle text if a subtitle is selected
        var subtitleState = this.alt.stores.SubtitleStore.state;
        if (subtitleState.subtitle.length > 0)
            subUtil.findLine(subtitleState.subtitle, subtitleState.trackSub, player.subDelay, time).then(result => {
                if (result && result.text != subtitleState.text)
                    this.actions.settingChange(result);
            });

    }

    }, {
    key: 'findSubs',
    value: function 
    findSubs(itemDesc, cb, idx) {

        var subQuery = {
            filepath: itemDesc.path,
            fps: player.wcjs.input.fps
        };

        if (itemDesc.byteSize)
            subQuery.byteLength = itemDesc.byteSize;

        if (itemDesc.torrentHash) {
            subQuery.torrentHash = itemDesc.torrentHash;
            subQuery.isFinished = false;
        }

        subQuery.cb = subs => {
            if (!subs) {
                if (!ls.isSet('playerNotifs') || ls('playerNotifs'))
                    player.notifier.info('Subtitles Not Found', '', 6000);
                cb && cb(false);
            } else {
                this.actions.foundSubs(subs, true, idx, cb);
            }
        }

        subUtil.fetchSubs(subQuery);

    }
    
    }, {
    key: 'foundSubs',
    value: function 
    foundSubs(subs, announce, idx, cb) {

        if (!idx) idx = player.wcjs.playlist.currentItem;
        var playerState = PlayerStore.getState();

        ControlActions.settingChange({
            foundSubs: true
        });
        var prevSubs = player.itemDesc(idx).setting.subtitles || {};
        subs = _.extend({}, prevSubs, subs);
        PlayerActions.setDesc({
            idx: idx,
            subtitles: subs
        });
        if ((!ls.isSet('playerNotifs') || ls('playerNotifs')) && announce)
            player.notifier.info('Found Subtitles', '', 6000);

        cb && cb(true);
    }

    }, {
    key: 'loadSub',
    value: function 
    loadSub(subLink) {
        subUtil.loadSubtitle(subLink, parsedSub => {
            if (!parsedSub) {
                PlayerActions.announcement('Subtitle Loading Failed');
            } else {
                this.actions.settingChange({
                    subtitle: parsedSub,
                    delay: 0,
                    trackSub: -1,
                    text: ''
                });
                player.fields.subDelay.value = '0 ms';
                player.wcjs.subtitles.delay = 0;
            }
        });
    }
    }]);
    return SubtitleActions;

}


module.exports = alt.createActions(SubtitleActions);
