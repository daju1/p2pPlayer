var React = require('react');
var PureRenderMixin = require('react-addons-pure-render-mixin');

var ProgressStore = require('./store');
var ProgressActions = require('./actions');
var player = require('../../../../utils/player');
var _ = require('lodash');

module.exports = React.createClass({

    mixins: [PureRenderMixin],

    getInitialState() {
        return {
            position: 0,
            scrobbling: false,
            keepScrobble: false,
            seekPerc: 0,
            scrobbleHeight: 'scrobbler',
            cache: 0
        }
    },
    componentWillMount() {
        ProgressStore.listen(this.update);
    },
    componentDidMount() {
        window.addEventListener('mousemove', this.globalMouseMoved);
        window.addEventListener('mouseup', ProgressActions.handleGlobalMouseUp);
    },
    componentWillUnmount() {
        ProgressStore.unlisten(this.update);
        window.removeEventListener('mousemove', this.globalMouseMoved);
        window.removeEventListener('mouseup', ProgressActions.handleGlobalMouseUp);
    },
    globalMouseMoved(evt) {
        ProgressActions.handleGlobalMouseMove(evt.pageX);
    },
    throttleScrobblerHover(evt) {
        ProgressActions.handleScrobblerHover(evt.pageX);
    },
    update() {
        if (this.isMounted()) {
//            console.log('progressbar update');
            var progressState = ProgressStore.getState();
            this.setState({
                position: progressState.position,
                scrobbling: progressState.scrobbling,
                progressHover: progressState.progressHover,
                scrobbleHeight: progressState.scrobbleHeight,

                keepScrobble: progressState.keepScrobble,
                seekPerc: progressState.seekPerc,
                cache: progressState.cache
            });
        }
    },
    render() {
        var scrobblerStyles = {
            time: {
                width: (this.state.scrobbling || this.state.keepScrobble ? this.state.seekPerc : this.state.position) * 100 + '%'
            },
            buffer: {
                width: this.state.cache * 100 + '%'
            }
        };
        return '';/*(
            <div>
                <div
                    className="scrobbler-padding"
                    onMouseUp={ProgressActions.handleScrobble}
                    onMouseDown={ProgressActions.handleDragStart}
                    onMouseEnter={ProgressActions.handleDragEnter}
                    onMouseOut={ProgressActions.handleDragEnd}
                    onMouseMove={this.throttleScrobblerHover} />
                <div ref="scrobbler-height" className={this.state.scrobbleHeight}>
                    <div style={scrobblerStyles.buffer} className="buffer"/>
                    <div ref="scrobbler-time" style={scrobblerStyles.time} className="time smooth-progress"/>
                    <div ref="scrobbler-handle" className="handle"/>
                </div>
            </div>
        );*/
    }
});