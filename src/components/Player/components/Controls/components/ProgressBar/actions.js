var alt = require('../../../../../../alt');
var helper = require('../../../../../../helper');
var _ = require('lodash');
var TooltipActions = require('../Tooltip/actions');
var VisibilityActions = require('../../../Visibility/actions');
var {handleTime} = require('../../../../utils/time');
var cacheUtil = require('../../../../utils/cache');
var player = require('../../../../utils/player');

var throttlers = {};

var ProgressActions = function() {

    function ProgressActions() {
        helper.classCallCheck(this, ProgressActions);
        this.generateActions(
            'settingChange',
            'changeTime',
            'position',
            'scrobble',
            'seekable',
            'delayScrobbleGUI',
            'setCache'
        );
    }

    helper.createClass(ProgressActions, [{

    key: 'handleScrobblerThrottle',
    value: function 
    handleScrobblerThrottle(pageX) {
        if (!throttlers.scrobble)
            throttlers.scrobble = _.throttle(this.actions.handleScrobblerHover, 50);
        throttlers.scrobble(pageX);
    }

    }, {
    key: 'handleScrobblerHover',
    value: function 
    handleScrobblerHover(pageX) {

        if (!pageX) return;

        var timeState = this.alt.stores.TimeStore.state,
            progressState = this.alt.stores.ProgressStore.state,
            tooltipState = this.alt.stores.TooltipStore.state,
            visibilityState = this.alt.stores.VisibilityStore.state,
            newState = {},
            newTooltipState = {},
            total_time = timeState.length,
            percent_done = pageX / document.body.clientWidth,
            newTime = total_time * percent_done;

        if (tooltipState.scrobbleTooltip != 'inline-block')
            newTooltipState.scrobbleTooltip = 'inline-block';

        if (timeState.currentTime != '00:00') {

            if (percent_done <= 0.5)
                var realPos = Math.floor(window.innerWidth * percent_done) - tooltipState.tooltipHalf;
            else
                var realPos = Math.floor(window.innerWidth * percent_done) + tooltipState.tooltipHalf;

            var seekTime = handleTime(percent_done * total_time, total_time);

            if (seekTime.length > 5)
                newTooltipState.tooltipHalf = 33;
            else
                newTooltipState.tooltipHalf = 24;

            if (realPos < 0) newState.tooltipLeft = newTooltipState.tooltipHalf + 'px';
            else if (realPos > window.innerWidth) newTooltipState.tooltipLeft = (window.innerWidth - newTooltipState.tooltipHalf) + 'px';
            else newTooltipState.tooltipLeft = (percent_done * 100) + '%';

            newTooltipState.humanTime = seekTime;
        }

        if (progressState.scrobbling) {
            newState.seekPerc = percent_done < 0 ? 0 : percent_done > 1 ? 1 : percent_done;
            if (!visibilityState.uiShown)
                VisibilityActions.uiShown(true);
        }

        if (Object.keys(newState).length)
            this.actions.settingChange(newState);
            
        if (Object.keys(newTooltipState).length)
            TooltipActions.settingChange(newTooltipState);

    }
    
    }, {
    key: 'handleScrobble',
    value: function 
    handleScrobble(event) {
        
        if (player.wcjs.state != 3) {
            // remove progress bar transition effect periodically
            var progressElem = document.querySelector('.wcjs-player .time');
            progressElem.className = progressElem.className.split(' smooth-progress').join('');
            _.delay(() => {
                progressElem.className = progressElem.className + ' smooth-progress';
            },500);
        }

        var progressState = this.alt.stores.ProgressStore.getState(),
            timeState = this.alt.stores.TimeStore.getState();

        if (!timeState.length || !progressState.seekable)
            return;

        _.delay(() => {
            if (event.pageX) {
                this.actions.settingChange({
                    keepScrobble: false,
                    scrobbling: false,
                    position: progressState.seekPerc,
                    scrobbleHeight: progressState.scrobbleHeight.replace(' scrobbling', '')
                });
                
                TooltipActions.settingChange({
                    scrobbleTooltip: 'none'
                });

                this.actions.delayScrobbleGUI();
                var percent_done = event.pageX / document.body.clientWidth;

                cacheUtil.checkCache(player, percent_done);

                this.actions.scrobble(timeState.length * percent_done);
            }
        }, 100);

    }

    }, {
    key: 'handleDragStart',
    value: function 
    handleDragStart(event) {
        
        if (player.wcjs.length) {

            var progressElem = document.querySelector('.wcjs-player .time'),
                progressState = this.alt.stores.ProgressStore.state,
                percent_done = event.pageX / document.body.clientWidth;

            // remove transition from progress bar
            progressElem.className = progressElem.className.split(' smooth-progress').join('');

            this.actions.settingChange({
                keepScrobble: true,
                seekPerc: percent_done,
                scrobbling: true,
                scrobbleHeight: progressState.scrobbleHeight + ' scrobbling'
            });
            this.actions.delayScrobbleGUI();

        }
    }

    }, {
    key: 'handleDragEnter',
    value: function 
    handleDragEnter(event) {
        if (player.wcjs.length) {
            this.actions.settingChange({
                progressHover: true
            });
            TooltipActions.settingChange({
                progressHover: true
            });
        }
    }

    }, {
    key: 'handleDragEnd',
    value: function 
    handleDragEnd() {
        var progressState = this.alt.stores.ProgressStore.state,
            newTooltipState = {};

        this.actions.settingChange({
            progressHover: false
        });
        newTooltipState.progressHover = false;
        if (!progressState.scrobbling)
            newTooltipState.scrobbleTooltip = 'none';

        TooltipActions.settingChange(newTooltipState);
    }

    }, {
    key: 'handleGlobalMouseMove',
    value: function 
    handleGlobalMouseMove(pageX) {
        var progressState = this.alt.stores.ProgressStore.state;
        if (progressState.scrobbling)
            this.actions.handleScrobblerThrottle(pageX);
    }

    }, {
    key: 'handleGlobalMouseUp',
    value: function 
    handleGlobalMouseUp(event) {
        var progressState = this.alt.stores.ProgressStore.state;
        if (progressState.scrobbling) {
            _.delay(() => {
                this.actions.handleScrobble(event);
                _.delay(() => {
                    TooltipActions.settingChange({
                        scrobbleTooltip: 'none'
                    });

                    // add transition for progress bar
                    var progressElem = document.querySelector('.wcjs-player .time');
                    progressElem.className = progressElem.className + ' smooth-progress';

                },100);
            },50);
        }
    }

    }, {
    key: 'delayTime',
    value: function 
    delayTime(t) {
        if (!throttlers.timeChange)
            throttlers.timeChange = _.throttle(this.actions.changeTime, 100);
        throttlers.timeChange(t);
    }
    }]);
    return ProgressActions;

}();

module.exports = alt.createActions(ProgressActions);
