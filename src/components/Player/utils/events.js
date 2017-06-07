var _ = require('lodash');
var ls = require('local-storage');

var player = require('./player');
var traktUtil = require('./trakt');
var ui = require('./ui');
var linkSupport = require('./supportedLinks');
var prebuffering = require('./prebuffering');
var path = require('path');

var PlayerActions = require('../actions');
var ProgressStore = require('../components/Controls/components/ProgressBar/store');
var ControlStore = require('../components/Controls/store');
var ControlActions = require('../components/Controls/actions');
var TimeActions = require('../components/Controls/components/HumanTime/actions');
var ProgressActions = require('../components/Controls/components/ProgressBar/actions');
var VisibilityActions = require('../components/Visibility/actions');
var SubtitleActions = require('../components/SubtitleText/actions');
var engineStore = require('../../../stores/engineStore');
var torrentUtil = require('../../../utils/stream/torrentUtil');
var torrentActions = require('../../../actions/torrentActions');
var sources = require('./sources');

var events = {};

var immuneToEvents = false

events.buffering = (perc) => {

    var itemDesc = player.itemDesc();
    if (player.secondPlay && perc == 100) {
        player.secondPlay = false;
        _.delay(() => {
            // i don't like it, but if a delay is not set it sometimes bugs
            PlayerActions.updateImage(player.itemDesc().setting.image);
        }, 500);
    }
    var isLocal = (itemDesc.mrl && itemDesc.mrl.indexOf('file://') == 0);
    if (!isLocal) {
        var announcer = {};

        var engineState = engineStore.getState();

        var isTorrent = (engineState.torrents && engineState.infoHash && engineState.torrents[engineState.infoHash] && engineState.torrents[engineState.infoHash].torrent);

        if (isTorrent && !engineState.torrents[engineState.infoHash].torrent.pieces.bank.get().downloaded && perc == 0) {
            announcer.text = 'Prebuffering 0%';
        } else {
            announcer.text = 'Buffering ' + perc + '%';
        }

        var current = player.wcjs.playlist.currentItem;
        if (isTorrent && current > -1 && itemDesc && itemDesc.mrl.startsWith('http://') && typeof itemDesc.setting.streamID !== 'undefined') {
            // check if the file has been completely downloaded
            var file = engineState.torrents[engineState.infoHash].files[itemDesc.setting.streamID];
            if (file) {
                var pieceInfo = engineState.torrents[engineState.infoHash].torrent.pieces.bank.get();
                if (pieceInfo.downloaded == pieceInfo.total) {
                    // file is completely downloaded, so it shouldn't need to buffer
                    // this is a VLC bug and we'll solve it by switching to the local
                    // file instead of the streaming link
                    console.log('Fixing Excess Buffering Issue')

                    var progressElem = document.querySelector('.wcjs-player .time');
                    progressElem.className = progressElem.className.split(' smooth-progress').join('');
                    immuneToEvents = true
                    _.delay(() => {
                        progressElem.className = progressElem.className + ' smooth-progress';
                        immuneToEvents = false
                    },1000);

                    var progressState = ProgressStore.getState()

                    PlayerActions.replaceMRL({
                        autoplay: true,
                        x: current,
                        mrl: {
                            title: itemDesc.setting.title || itemDesc.title,
                            thumbnail: itemDesc.setting.image,
                            uri: 'file:///' + itemDesc.setting.path,
                            byteSize: itemDesc.setting.byteSize,
                            streamID: itemDesc.setting.streamID,
                            path: itemDesc.setting.path,
                            torrentHash: itemDesc.setting.torrentHash
                        }
                    })
                    
                    if (itemDesc.setting && itemDesc.setting.trakt) {
                        var shouldScrobble = traktUtil.loggedIn ? ls.isSet('traktScrobble') ? ls('traktScrobble') : true : false;
                        if (shouldScrobble)
                            traktUtil.handleScrobble('start', itemDesc, progressState.position);
                    }

                    var noAnnounce = true

                }
            }
        }
        clearTimeout(player.announceTimer);

        if (perc === 100) {
            if (!player.announceEffect) {
                announcer.effect = true;
            }
        } else if (player.announceEffect)
            announcer.effect = false;

        if (Object.keys(announcer).length && !noAnnounce)
            player.events.emit('announce', announcer);
    }

}

events.opening = () => {
    
    if (immuneToEvents) return

    PlayerActions.togglePowerSave(true);
    var itemDesc = player.itemDesc();
    var isLocal = (itemDesc.mrl && itemDesc.mrl.indexOf('file://') == 0);

    if (itemDesc.artworkURL && !itemDesc.setting.image) {
        PlayerActions.setDesc({
            image: itemDesc.artworkURL
        })
    }

    if (!isLocal) {

        var timestamp = new Date().getTime();

        if (itemDesc && itemDesc.setting.youtubeDL && itemDesc.setting.timestamp < timestamp -1000) {
            // this is a youtube-dl supported link, let's refresh it to make sure the link didn't expire
            
            var currentItem = player.wcjs.playlist.currentItem;
            window.currentItem = currentItem;
            player.events.emit('playlistUpdate');

            player.wcjs.stop();

            player.wcjs.playlist.mode = 0;

            sources.youtubeDL(itemDesc.setting.originalURL, info => {
                if (window.currentItem == currentItem) {
                    delete window.currentItem;
                    _.defer(() => {
                        PlayerActions.replaceMRL({
                            autoplay: true,
                            x: currentItem,
                            mrl: {
                                title: info.fulltitle ? info.fulltitle : null,
                                thumbnail: info.thumbnail ? info.thumbnail : null,
                                uri: info.url ? info.url : null,
                                youtubeDL: true
                            }
                        });
                    });
                }
            });

            return;
            
        } else if (itemDesc && itemDesc.setting.torrentHash && itemDesc.setting.torrentHash != engineStore.getState().infoHash) {

            window.nextHash = itemDesc.setting.torrentHash;

            window.currentItem = player.wcjs.playlist.currentItem;

            player.wcjs.playlist.mode = 0;

            player.events.emit('playlistUpdate');

            player.wcjs.stop();

            var callback = () => {
                torrentActions.clear();
                torrentUtil.init('magnet:?xt=urn:btih:' + window.nextHash).then( instance => {
                    var listener = () => {
                        
                        if (instance.infoHash == engineStore.getState().infoHash) {
                            // just soft kill this case to remove duplicates
                            instance.softKill();
                        } else if (instance.infoHash !== window.nextHash) {
                            if (ls('removeLogic') == 2) {
                                instance.kill();
                            } else {
                                instance.softKill();
                            }
                        } else {
                            torrentActions.add(instance);
                            for (var i = 0; i < player.wcjs.playlist.itemCount; i++) {
                                var pItemDesc = player.itemDesc(i);
                                if (pItemDesc.setting && pItemDesc.setting.torrentHash && pItemDesc.setting.torrentHash == window.nextHash) {
                                    PlayerActions.replaceMRL({
                                        autoplay: (window.currentItem == i),
                                        x: i,
                                        mrl: {
                                            title: pItemDesc.setting.title,
                                            thumbnail: pItemDesc.setting.image,
                                            uri: 'http://127.0.0.1:' + instance.server.port + '/' + pItemDesc.setting.streamID
                                        }
                                    })
                                }
                            }
                            delete window.currentItem;
                        }
                    };
                    if (instance.server && instance.server.port) listener();
                    else instance.on('listening', listener);
                })
            }

            var init = _.once(callback);

            var engineState = engineStore.getState();

            if (engineState.torrents[engineState.infoHash]) {
                if (ls('removeLogic') == 2) {
                    engineState.torrents[engineState.infoHash].kill(init);
                } else {
                    engineState.torrents[engineState.infoHash].softKill(init);
                }
                _.delay( init, 1000);
            } else init();

            return;

        }

        var announcer = {};
    
        announcer.text = 'Opening Media';
        clearTimeout(player.announceTimer);
    
        if (player.announceEffect)
            announcer.effect = false;
    
        if (Object.keys(announcer).length)
            player.events.emit('announce', announcer);
            
    }


    if (player.wcjs.playlist.currentItem != player.lastItem) {
        if (player.wcjs.volume != ls('volume'))
            player.wcjs.volume = ls('volume');

        if (player.wcjs.playlist.items[player.wcjs.playlist.currentItem].artworkURL) {
            var image = player.wcjs.playlist.items[player.wcjs.playlist.currentItem].artworkURL;
        } else {
            try {
                var image = JSON.parse(player.wcjs.playlist.items[player.wcjs.playlist.currentItem].setting).image;
            } catch (e) {}
        }

        _.defer(() => {
            PlayerActions.updateImage(image);
        });
        _.delay(() => {
            PlayerActions.updateImage(image);
        }, 1000)

        ProgressActions.settingChange({
            position: 0
        });
        player.events.emit('setTitle', player.wcjs.playlist.items[player.wcjs.playlist.currentItem].title);

        player.set({
            lastItem: player.wcjs.playlist.currentItem,
            pendingFiles: []
        });

    }

}

events.stopped = () => {
    
    if (immuneToEvents) return

    console.log('Player stopped');

    SubtitleActions.settingChange({
        text: ''
    });
    player.events.emit('foundTrakt', false);
    PlayerActions.togglePowerSave(false);
}

events.playing = () => {
    
    if (immuneToEvents) return

    PlayerActions.togglePowerSave(true);

    player.wcjs.playlist.mode = 1;

    player.events.emit('playlistUpdate');

    if (!player.firstPlay) {

        player.secondPlay = true;

        // i hate this, but otherwise it bugs
        _.delay(() => {
            PlayerActions.updateImage(player.itemDesc().setting.image);
        }, 500);

        _.delay(() => {
            PlayerActions.updateImage(player.itemDesc().setting.image);
        }, 1000);

        _.delay(() => {
            PlayerActions.updateImage(player.itemDesc().setting.image);
        }, 1500);

        // catch first play event
        prebuffering.end();

        player.wcjs.subtitles.track = 0;
            
        player.set({
            firstPlay: true
        });
        player.events.emit('setTitle', player.wcjs.playlist.items[player.wcjs.playlist.currentItem].title);
        var itemDesc = player.itemDesc();
        if (itemDesc.setting && itemDesc.setting.trakt && !player.foundTrakt) {
            player.events.emit('foundTrakt', true);
            var shouldScrobble = traktUtil.loggedIn ? ls.isSet('traktScrobble') ? ls('traktScrobble') : true : false;
            if (shouldScrobble) {
                traktUtil.handleScrobble('start', itemDesc, player.wcjs.position);
                if (!ls.isSet('playerNotifs') || ls('playerNotifs'))
                    player.notifier.info('Scrobbling', '', 4000);
            }
        }

        var itemDesc = itemDesc.setting;

        if (itemDesc.subtitles) {
            ControlActions.settingChange({ foundSubs: true });
            SubtitleActions.foundSubs(itemDesc.subtitles, false);
        } else if (itemDesc.path && (!ls.isSet('findSubs') || ls('findSubs')))
            SubtitleActions.findSubs(itemDesc);

        if (window.clSub) {
            // if subtitle command line arg set, load it
            var subs = player.itemDesc().setting.subtitles || {};
            subs[path.basename(window.clSub)] = window.clSub;
            PlayerActions.setDesc({
                subtitles: subs
            });
            player.wcjs.subtitles.track = 0;
            SubtitleActions.loadSub(window.clSub);
            SubtitleActions.settingChange({
                selectedSub: _.size(subs) + (player.wcjs.subtitles.count || 1),
            });
            player.notifier.info('Subtitle Loaded', '', 3000);

            delete window.clSub;
        }

    } else {
        var itemDesc = player.itemDesc();
        if (itemDesc.setting && itemDesc.setting.trakt) {
            var shouldScrobble = traktUtil.loggedIn ? ls.isSet('traktScrobble') ? ls('traktScrobble') : true : false;
            if (shouldScrobble)
                traktUtil.handleScrobble('start', itemDesc, player.wcjs.position);
        }
    }

    player.fields.audioTrack.value = player.wcjs.audio[1];
    player.events.emit('controlsUpdate');
}

events.paused = () => {
    player.events.emit('playlistUpdate');
    player.events.emit('controlsUpdate');
    traktUtil.handleScrobble('pause', player.itemDesc(), player.wcjs.position);
    PlayerActions.togglePowerSave(false);
}

events.resetUI = () => {

    ControlActions.settingChange({
        foundSubs: false
    });
    TimeActions.settingChange({
        currentTime: '00:00',
        totalTime: '00:00',
        length: 0
    });
    ProgressActions.settingChange({
        position: 0,
        cache: 0
    });
    SubtitleActions.settingChange({
        subtitle: [],
        selectedSub: 1,
        trackSub: -1,
        text: ''
    });
    player.events.emit('resizeNow', {
        aspect: 'Default',
        crop: 'Default',
        zoom: 1
    });
    player.events.emit('foundTrakt', false);
}

events.mediaChanged = () => {
    
    if (immuneToEvents) return

    prebuffering.end();
    prebuffering.start(player);

    events.resetUI();

    VisibilityActions.settingChange({
        subtitles: false
    });
    player.set({
        foundTrakt: false,
        firstPlay: false,
        audioChannel: 1,
        audioTrack: 1
    });

    ui.defaultSettings();

    player.events.emit('playlistUpdate');
    
    player.events.emit('setTitle', player.wcjs.playlist.items[player.wcjs.playlist.currentItem].title);

}

events.error = () => {

    console.log('Player encountered an error.');

    var itemDesc = player.itemDesc();

    traktUtil.handleScrobble('stop', itemDesc, player.wcjs.position);
    
    PlayerActions.togglePowerSave(false);

    console.log(itemDesc);

}

events.ended = () => {
    console.log('Playback ended');

    var position = ProgressStore.getState().position;

    player.events.emit('foundTrakt', false);
    traktUtil.handleScrobble('stop', player.itemDesc(), position);
    
    if (player.wcjs.time > 0) {
        if (typeof player.lastItem !== 'undefined' && position && position < 0.95) {

            console.log('Playback Ended Prematurely');
            console.log('Last Known Position: ', position);
            console.log('Last Known Item: ', player.lastItem);
            console.log('Reconnecting ...');

            player.wcjs.playlist.currentItem = player.lastItem;
            player.wcjs.playlist.play();
            player.wcjs.position = position;
        }
    }
    PlayerActions.togglePowerSave(false);
}

events.close = () => {

    events.resetUI();

    VisibilityActions.settingChange({
        uiShown: true,
        playlist: false,
        subtitles: false,
        settings: false
    });
    player.events.emit('setTitle', '');

    if (ControlStore.getState().fullscreen)
        ControlActions.toggleFullscreen();

    player.set({
        pendingFiles: [],
        files: [],
        audioChannel: 1,
        audioTrack: 1,
        lastItem: -1
    });

    ui.defaultSettings();
    if (player.wcjs) {
        traktUtil.handleScrobble('stop', player.itemDesc(), player.wcjs.position);
        player.wcjs.stop();
        player.wcjs.playlist.clear();
    }
    PlayerActions.togglePowerSave(false);

}

module.exports = events;