var alt = require('../../../../../../alt');
var helper = require('../../../../../../helper');
var progressActions = require('./actions');
var _ = require('lodash');
var player = require('../../../../utils/player');
var traktUtil = require('../../../../utils/trakt');
var TimeStore = require('../HumanTime/store');
var TimeActions = require('../HumanTime/actions');
var VisibilityStore = require('../../../Visibility/store');
var VisibilityActions = require('../../../Visibility/actions');
var {handleTime} = require('../../../../utils/time');

var throttlers = {
    scrobbleKeys: false
};

var ProgressStore = function(){

    function ProgressStore() {
        helper.classCallCheck(this, ProgressStore);
        this.bindActions(progressActions);

        this.keepScrobble = false;
        this.seekPerc = 0;
        this.position = 0;
        this.scrobbleHeight = 'scrobbler';
        this.scrobbling = false;
        this.seekable = true;
        this.cache = 0;

    }
    helper.createClass(ProgressStore, [{

    key: 'onSettingChange',
    value: function 
    onSettingChange(setting) {
        if (setting.position == 0) {
            // remove transition for progress bar periodically
            var progressElem = document.querySelector('.wcjs-player .time');
            if (progressElem) {
                progressElem.className = progressElem.className.split(' smooth-progress').join('');
                _.delay( () => {
                    progressElem.className = progressElem.className + ' smooth-progress';
                }, 100);
            }
        }
        this.setState(setting);
    }

    }, {
    key: 'onSetCache',
    value: function 
    onSetCache(float) {
        this.setState({
            cache: float
        });
    }

    }, {
    key: 'onSeekable',
    value: function 
    onSeekable(state) {
        this.setState({
            seekable: state
        });
    }

    }, {
    key: 'onScrobble',
    value: function 
    onScrobble(time) {

        if (time < 0) time = 0;
        else if (player.wcjs.length && time > player.wcjs.length) time = player.wcjs.length - 2000;

        if (!player.wcjs.playing) {
            this.setState({
                position: time / player.wcjs.length
            });
            _.defer(() => {
                TimeActions.settingChange({
                    currentTime: handleTime(time, player.wcjs.length)
                });
            });
        }

        if (player.wcjs.state == 6) {
            // if playback ended, restart last item
            player.playItem( player.wcjs.playlist.itemCount - 1 , true );
        }

        player.wcjs.time = time;

        traktUtil.handleScrobble('start', player.itemDesc(), player.wcjs.position);

    }

    }, {
    key: 'onChangeTime',
    value: function 
    onChangeTime(q) {

        var t = q.jump,
            d = q.delay;

        var wcjs = player.wcjs;

        if (TimeStore.getState().forceTime)
            var forceProgress = ((this.seekPerc * wcjs.length) + t) / wcjs.length;
        else
            var forceProgress = ((wcjs.position * wcjs.length) + t) / wcjs.length;

        if (forceProgress < 0) forceProgress = 0;
        else if (forceProgress > 1) forceProgress = 1;

        this.setState({
            keepScrobble: true,
            seekPerc: forceProgress,
        });
        
        _.defer(() => {
            TimeActions.settingChange({
                forceTime: true,
                overTime: handleTime((forceProgress * wcjs.length), wcjs.length)
            });
            if (!VisibilityStore.getState().uiShown)
                VisibilityActions.settingChange({
                    uiShown: true
                });
        });

        if (throttlers.scrobbleKeys) clearTimeout(throttlers.scrobbleKeys);
        if (throttlers.scrobbleKeys2) clearTimeout(throttlers.scrobbleKeys2);
        if (throttlers.scrobbleKeys3) clearTimeout(throttlers.scrobbleKeys3);

        var scrobbleFunc = () => {
            wcjs.position = this.seekPerc;
            this.setState({
                position: this.seekPerc,
            });
            _.defer(() => {
                TimeActions.settingChange({
                    forceTime: false,
                    time: this.seekPerc * wcjs.length,
                    currentTime: handleTime((this.seekPerc * wcjs.length), wcjs.length)
                });
            });
            throttlers.scrobbleKeys2 = setTimeout(() => {
                this.setState({
                    keepScrobble: false
                });
                throttlers.scrobbleKeys3 = setTimeout(() => {
                    if (VisibilityStore.getState().uiShown)
                        VisibilityActions.settingChange({
                            uiShown: false
                        });
                }, 1000);
            }, 1500);
            throttlers.scrobbleKeys = false;

            traktUtil.handleScrobble('start', player.itemDesc(), this.seekPerc);
        };

        throttlers.scrobbleKeys = setTimeout(scrobbleFunc.bind(this), d);

    }

    }, {
    key: 'onPosition',
    value: function 
    onPosition(pos) {
        if (player.wcjs.state == 5) pos = 0;
        if (this.position != pos)
            this.setState({
                position: pos
            });
    }

    }, {
    key: 'onDelayScrobbleGUI',
    value: function 
    onDelayScrobbleGUI() {
        _.delay(() => {
            this.setState({
                keepScrobble: false
            })
        }, 1000);
    }
    }]);
    return ProgressStore;

}();

module.exports = alt.createStore(ProgressStore);
