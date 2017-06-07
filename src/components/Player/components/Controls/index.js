var React = require('react');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var {
    History
}
= require('react-router');
var _ = require('lodash');
var HumanTime = require('./components/HumanTime');
var ProgressBar = require('./components/ProgressBar');
var Tooltip = require('./components/Tooltip');
var Volume = require('./components/Volume');
var player = require('../../utils/player');
var ControlStore = require('./store');
var ControlActions = require('./actions');
var VolumeActions = require('./components/Volume/actions');
var VisibilityStore = require('../Visibility/store');

var ls = require('local-storage');
var ui = require('../../utils/ui');

module.exports = React.createClass({
    mixins: [PureRenderMixin],

    getInitialState() {
        var visibilityState = VisibilityStore.getState();
        
        return {
            playing: player.wcjs.playing,
            fullscreen: false,
            uiShown: visibilityState.uiShown || visibilityState.playlist || visibilityState.settings,
            uiHidden: visibilityState.uiHidden,
            subtitlesOpen: visibilityState.subtitles,
            castingOpen: visibilityState.casting,
            rippleEffects: ls.isSet('playerRippleEffects') ? ls('playerRippleEffects') : true,

            foundSubs: false
        }
    },
    componentWillMount() {
        VisibilityStore.listen(this.update);
        ControlStore.listen(this.update);
    },
    componentDidMount() {
        player.events.on('controlsUpdate', this.update);
    },
    componentWillUnmount() {
        VisibilityStore.unlisten(this.update);
        ControlStore.unlisten(this.update);
        player.events.removeListener('controlsUpdate', this.update);
    },
    update() {
        if (this.isMounted()) {
            var controlState = ControlStore.getState();
            var visibilityState = VisibilityStore.getState();

            this.setState({
                playing: player.wcjs.playing,
                uiShown: visibilityState.uiShown || visibilityState.playlist || visibilityState.settings,
                uiHidden: visibilityState.uiHidden,
                subtitlesOpen: visibilityState.subtitles,
                castingOpen: visibilityState.casting,
                rippleEffects: ls.isSet('playerRippleEffects') ? ls('playerRippleEffects') : true,

                foundSubs: controlState.foundSubs,
                
                fullscreen: controlState.fullscreen
            });
        }
    },
    rippleStart(e) {
        document.querySelector('#controlsRipple').uiDownAction(e);
    },
    rippleEnd(e) {
        document.querySelector('#controlsRipple').uiUpAction(e);
    },
    render() {
        return '';/*(
            <div className={this.state.uiHidden ? 'control-bar' : this.state.uiShown ? 'control-bar show' : 'control-bar'} onMouseEnter={VolumeActions.volumeIndexEffect} onMouseLeave={VolumeActions.volumeIndexEffect}>
                <div className="controls-background" onClick={ControlActions.handlePausePlay}>
                    <paper-ripple id="controlsRipple" center noink={this.state.rippleEffects ? false : true} fit />
                </div>
                <ProgressBar />
                <Tooltip />
                <HumanTime />

                <paper-icon-button onClick={ControlActions.handlePausePlay} onMouseDown={this.rippleStart} onMouseUp={this.rippleEnd} className={'play-toggle'} icon={'av:' + (this.state.playing ? 'pause' : 'play-arrow')} noink={true} />

                <paper-icon-button onClick={player.prev} className={'prev-button'} icon={'av:skip-previous'} noink={true} />
                <paper-icon-button onClick={player.next} className={'next-button'} icon={'av:skip-next'} noink={true} />

                <Volume />
                <paper-icon-button onClick={ControlActions.toggleFullscreen} className="fullscreen-toggle" icon={this.state.fullscreen ? 'fullscreen-exit' : 'fullscreen'} noink={true} />
                <paper-icon-button onClick={ui.toggleMenu.bind(null, 'subtitles')} className={'subtitles-toggle' + (this.state.subtitlesOpen ? ' subtitles-toggle-active' : '')} icon={'av:closed-caption'} noink={true} />
                <paper-icon-button onClick={ui.toggleMenu.bind(null, 'casting')} className={'casting-toggle' + (this.state.castingOpen ? ' casting-toggle-active' : '')} icon={'hardware:cast'} noink={true} />

            </div>
        );*/
    }
});
