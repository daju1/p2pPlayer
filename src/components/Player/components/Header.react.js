var React = require('react');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var {
    History
}
= require('react-router');

var PlayerStore = require('../store');
var PlayerActions = require('../actions');
var VisibilityStore = require('./Visibility/store');
var ModalActions = require('./Modal/actions');
var {
    ipcRenderer
}
= require('electron');
var BaseModalActions = require('../../Modal/actions');
var torrentActions = require('../../../actions/torrentActions');
var engineStore = require('../../../stores/engineStore');
var ls = require('local-storage');
var ui = require('../utils/ui');
var player = require('../utils/player');
var events = require('../utils/events');
var _ = require('lodash');
var LinkSupport = require('./../utils/supportedLinks');

module.exports = React.createClass({

    mixins: [History, PureRenderMixin],

    getInitialState() {
        var visibilityState = VisibilityStore.getState();
        return {
            title: '',
            uiShown: visibilityState.uiShown && !visibilityState.playlist && !visibilityState.settings,
            uiHidden: visibilityState.uiHidden,
            playlistOpen: visibilityState.playlist,
            settingsOpen: visibilityState.settings,
            foundTrakt: false
        }
    },
    componentWillMount() {
        VisibilityStore.listen(this.update);
        player.events.on('foundTrakt', this.showTrakt);
        player.events.on('setTitle', this.setTitle);
    },
    componentWillUnmount() {
        VisibilityStore.unlisten(this.update);
        player.events.removeListener('foundTrakt', this.showTrakt);
        player.events.removeListener('setTitle', this.setTitle);
    },
    update() {
        if (this.isMounted()) {
//            console.log('header update');
            var visibilityState = VisibilityStore.getState();
            this.setState({
                uiShown: visibilityState.uiShown && !visibilityState.playlist && !visibilityState.settings,
                uiHidden: visibilityState.uiHidden,
                playlistOpen: visibilityState.playlist,
                settingsOpen: visibilityState.settings
            });
        }
    },
    showTrakt(state) {
        this.setState({
            foundTrakt: state
        });
        player.set({
            foundTrakt: state
        });
    },
    setTitle(title) {
        this.setState({
            title: title
        });
    },
    handleClose() {

        player.events.emit('windowTitleUpdate', '');

        if (player.alwaysOnTop) {
            player.set({
                alwaysOnTop: false
            });
            PlayerActions.toggleAlwaysOnTop(false);
        }

        var Linky = new LinkSupport;
        Linky.stopParsing();
        
        var engineState = engineStore.getState();
        
        player.wcjs.stop();
        player.wcjs.playlist.clear();
        
        if (engineState.infoHash && engineState.torrents[engineState.infoHash]) {
            // it's a torrent, let's see if we should remove the files
            if (ls('removeLogic') < 1) {
                BaseModalActions.shouldExit(false);
                BaseModalActions.open({ type: 'askRemove' });
            } else {
                var torrent = engineState.torrents[engineState.infoHash];
    
                if (ls('removeLogic') == 1) {
                    torrent.kill();
                } else if (ls('removeLogic') == 2) {
                    torrent.softKill();
                }
                torrentActions.clear();
                events.close();
                this.history.replaceState(null, '');
            }
        } else {

            events.close();
            this.history.replaceState(null, '');
            
        }
    },
    handleCloseApp() {
        if (player.alwaysOnTop) {
            player.set({
                alwaysOnTop: false
            });
            PlayerActions.toggleAlwaysOnTop(false);
        }

        var Linky = new LinkSupport;
        Linky.stopParsing();
        
        var engineState = engineStore.getState();
        
        player.wcjs.stop();
        player.wcjs.playlist.clear();
        
        if (engineState.infoHash && engineState.torrents[engineState.infoHash]) {
            // it's a torrent, let's see if we should remove the files
            if (ls('removeLogic') < 1) {
                BaseModalActions.shouldExit(true);
                BaseModalActions.open({ type: 'askRemove' });
            } else {
                var torrent = engineState.torrents[engineState.infoHash];
    
                if (ls('removeLogic') == 1) {
                    torrent.kill(() => {
                        ipcRenderer.send('app:close');
                    });
                } else if (ls('removeLogic') == 2) {
                    torrent.softKill(() => {
                        ipcRenderer.send('app:close');
                    });
                }
                torrentActions.clear();
                events.close();
            }
        } else {
            events.close();
            ipcRenderer.send('app:close');
            
        }
    },
    handleOpenTrakt() {
        if (this.state.foundTrakt) {
            ModalActions.open({
                title: 'Trakt Info',
                type: 'TraktInfo',
                theme: 'DarkRawTheme'
            });
        } else {
            ModalActions.open({
                title: 'Trakt Search',
                type: 'TraktSearch',
                theme: 'DarkRawTheme'
            });
        }
    },
    handleOpenSettings() {

        ui.toggleMenu('settings');
        
        // this is a hack to show the underline for the settings menu tabs
        _.defer(() => {
            Polymer.dom().querySelector('paper-tabs').notifyResize();
        });
    },
    handleOpenDashboard() {
        document.querySelector('.mini-menu').style.display = 'none';

        player.saveState = {
            idx: player.wcjs.playlist.currentItem,
            position: player.wcjs.position
        };

        player.wcjs.stop();

        this.history.replaceState(null, 'torrentDashboard');
    },
    render() { return '';/*
        if (player && player.wcjs && player.wcjs.playlist.currentItem > -1) {
            var isLocal = player.itemDesc().mrl.startsWith('file://');
        } else var isLocal = false;

        if (!isLocal) {
            var engineState = engineStore.getState();
            var isTorrent = !!(engineState.infoHash && engineState.torrents[engineState.infoHash]);
        } else var isTorrent = false;

        return (
            <div>
                <div className={this.state.uiHidden ? 'header' : this.state.playlistOpen ? 'header playlist-head' : this.state.settingsOpen ? 'header settings-head' : this.state.uiShown ? 'header show' : 'header'}>
                    <paper-icon-button id="playerMainBack" onClick={this.handleClose} className="player-close" icon={'arrow-back'} noink={true} />
                    <paper-tooltip for="playerMainBack" offset="0" id="playerBackTooltip">Main Menu</paper-tooltip>
    
                    <p className="title" style={{width: 'calc(100% - '+(this.state.foundTrakt || isLocal || isTorrent ? '216' : '176')+'px)'}}>{this.state.title}</p>

                    <p className="windowDrag" style={{width: 'calc(100% - '+(this.state.foundTrakt || isLocal || isTorrent ? '216' : '176')+'px)'}} />
    
                    <paper-icon-button id="closeBut" className="close-app" icon={'icons:close'} noink={true} onClick={this.handleCloseApp} />
                    <paper-tooltip for="closeBut" className="close-but-tooltip" offset="0">Close</paper-tooltip>
    
                    <paper-icon-button id="playerPlaylistBut" onClick={ui.toggleMenu.bind(null, 'playlist')} className="player-playlist" icon={'av:playlist-add-check'} noink={true} />
                    <paper-tooltip for="playerPlaylistBut" offset="0">Playlist</paper-tooltip>
    
                    <paper-icon-button id="playerSetBut" className="dropdown-trigger player-settings" icon={'image:tune'} noink={true} onClick={this.handleOpenSettings} />
                    <paper-tooltip for="playerSetBut" offset="0">Settings</paper-tooltip>
    
    
                    <paper-icon-button id="traktBut" onClick={this.handleOpenTrakt} className={'trakt-info' + (!this.state.foundTrakt && (isLocal || isTorrent) ? ' semi-trakt' : '')} src="./images/trakt-logo.png" style={{ display: this.state.foundTrakt || isLocal || isTorrent ? 'block' : 'none' }} noink={true} />
                    <paper-tooltip for="traktBut" offset="0">{!this.state.foundTrakt && (isLocal || isTorrent) ? 'Trakt Search' : 'Trakt Info'}</paper-tooltip>
    
                </div>
            </div>
        );*/
    }
});