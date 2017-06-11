﻿var React = require('react');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var PlayerHeader = require('./components/Header.react');
var PlayerControls = require('./components/Controls');
var PlayerRender = require('./components/Renderer.react');
var Playlist = require('./components/Playlist.react');
var Settings = require('./components/MenuHolders/Settings');
var SubtitleList = require('./components/Subtitles.react');
var CastingMenu = require('./components/CastingMenu.react');
var SubtitleText = require('./components/SubtitleText');
var SubtitleActions = require('./components/SubtitleText/actions');
var Announcement = require('./components/Announcement.react');
var PlayerActions = require('./actions');
var path = require('path');
var _ = require('lodash');
var metaParser = require('./utils/metaParser');
var parser = require('./utils/parser');
var sorter = require('./utils/sort');
var fs = require('fs');
var supported = require('../../utils/isSupported');

var {
    webFrame
} = require('electron');
var remote = require('remote');
var ls = require('local-storage');
var player = require('./utils/player');
var cacheUtil = require('./utils/cache');
var hotkeys = require('./utils/hotkeys');
var contextMenu = require('./utils/contextMenu');

var ControlStore = require('./components/Controls/store');
var ControlActions = require('./components/Controls/actions');
var VisibilityStore = require('./components/Visibility/store');
var VisibilityActions = require('./components/Visibility/actions');
var torrentStream = require('torrent-stream');
var torrentUtil = require('../../utils/stream/torrentUtil');
var linkUtil = require('../../utils/linkUtil');
var readTorrent = require('read-torrent');
var getPort = require('get-port');

var ReactNotify = require('react-notify');

var {mouseTrap} = require('react-mousetrap');

var lastPos = false;

class Player {
    //mixins: [PureRenderMixin],
    constructor()
    {
        this.props = {}

        this.componentWillMount();
        this.componentDidMount();
    }

    getInitialState() {
        var visibilityState = VisibilityStore.getState();
        return {
            uiShown: visibilityState.uiShown
        }
    }
    componentWillMount() {
        if (!ls.isSet('customSubSize'))
            ls('customSubSize', 100);
        VisibilityStore.listen(this.update);
        remote.getCurrentWindow().setMinimumSize(392, 228);
        webFrame.setZoomLevel(ls.isSet('zoomLevel') ? ls('zoomLevel') : 0);
        //hotkeys.attach(this.props);

        if (ls('resizeOnPlaylist'))
            window.firstResize = true;
        
        // fix window resize on top side    
        if (document.querySelector('header'))
            document.querySelector('header').style.WebkitAppRegion = "no-drag"
    }
    componentWillUnmount() {
        VisibilityStore.unlisten(this.update);
        hotkeys.detach(this.props);
        cacheUtil.stop();
        window.removeEventListener('contextmenu', contextMenu.listen);
        window.removeEventListener('mousemove', this.hover);
        var handler = document.getElementsByClassName("wcjs-player")[0];
console.log(document);

        handler.removeEventListener('dragenter', this.dragEnter)
        handler.removeEventListener('dragover', this.nullEvent);
        handler.removeEventListener('dragleave', this.nullEvent);
        handler.removeEventListener('dragend', this.nullEvent);
        handler.removeEventListener('drop', this.fileDrop);

        // fix window resize on top side
        if (document.querySelector('header'))
            document.querySelector('header').style.WebkitAppRegion = "drag"
    }
    componentDidMount() {
        var announcer = document.getElementsByClassName('wcjs-announce')[0];
//        if (['', '0'].indexOf(announcer.style.opacity) > -1) {
//            events.buffering(0);
//        }
        player.set({
            //notifier: this.refs.notificator
        });
        cacheUtil.start(player);
        player.loadState();
        window.addEventListener('contextmenu', contextMenu.listen, false);
        window.addEventListener('mousemove', this.hover, false);

        var handler = document.getElementsByClassName("wcjs-player")[0];
console.log(document);
if (!handler){
console.warn('have not fount wcjs-player div');
}
else{
        handler.ondragover = handler.ondragleave = handler.ondragend = this.nullEvent;
        handler.ondragenter = this.dragEnter;
        handler.ondrop = this.fileDrop;
}
        if (window.clFullscreen) {
            delete window.clFullscreen;
            ControlActions.toggleFullscreen();
        }

    }
    update() {
//        console.log('player update');
        if (this.isMounted()) {
            var visibilityState = VisibilityStore.getState();
            this.setState({
                uiShown: visibilityState.uiShown
            });
        }
    }
    dragEnter(e) {
        var data = e && e.dataTransfer && e.dataTransfer.items ? e.dataTransfer.items : [];
        if (process.platform == 'darwin' && data && data.length && data[0].kind != 'file') {

            var dropDummy = document.querySelector('.dropDummy');
            dropDummy.style.display = "block";

            var dropMiddleware = (e) => {
                setTimeout(() => {
                    if (dropDummy.value) {
                        this.fileDrop({
                            preventDefault: function() {},
                            dataTransfer: {
                                files: [],
                                getData: function() { return dropDummy.value }
                            }
                        })
                    } else {
                        this.fileDrop(e)
                    }
                    dropDummy.style.display = "none";
                    dropDummy.value = "";
                }, 100)
                dropDummy.removeEventListener('dragleave', leaveMiddleware)
                dropDummy.removeEventListener('drop', dropMiddleware)
            }

            var leaveMiddleware = (e) => {
                setTimeout(() => {
                    dropDummy.style.display = "none";
                    dropDummy.value = "";
                    dropDummy.removeEventListener('dragleave', leaveMiddleware)
                    dropDummy.removeEventListener('drop', dropMiddleware)
                }, 150)
            }

            dropDummy.addEventListener('dragleave', leaveMiddleware)
            dropDummy.addEventListener('drop', dropMiddleware)
        }
    }
    nullEvent() {
        return false;
    }
    fileDrop(e) {

        e.preventDefault();

        if (window.immuneToDrop) return false;

        var files = e.dataTransfer.files;
        
        var engine = {};
        
        var handleTorrent = () => {
            torrentUtil.getContents(engine.torrent.files, engine.torrent.infoHash).then( files => {
                var fileSelectorData = _.omit(files, ['files_total', 'folder_status']);
                var folder = fileSelectorData[Object.keys(fileSelectorData)[0]];
                var file = folder[Object.keys(folder)[0]];
                var newFiles = [];
                var queueParser = [];

                if (files.ordered.length) {
                    var port = getPort();
                    var ij = player.wcjs.playlist.itemCount;
                    files.ordered.forEach( file => {
                        if (file.name.toLowerCase().replace("sample","") == file.name.toLowerCase() && file.name != "ETRG.mp4" && file.name.toLowerCase().substr(0,5) != "rarbg") {
                            newFiles.push({
                                title: parser(file.name).name(),
                                uri: 'http://127.0.0.1:' + port + '/' + file.id,
                                byteSize: file.size,
                                torrentHash: file.infoHash,
                                streamID: file.id,
                                path: file.path
                            });
                            queueParser.push({
                                idx: ij,
                                url: 'http://127.0.0.1:' + port + '/' + file.id,
                                filename: file.name
                            });
                            ij++;
                        }
                    });
                }

                if (newFiles.length) {
                    PlayerActions.addPlaylist(newFiles);
                    // start searching for thumbnails after 1 second
                    _.delay(() => {
                        if (queueParser.length) {
                            queueParser.forEach( el => {
                                metaParser.push(el);
                            });
                        }
                    },1000);
                }

                player.notifier.info('Torrent Added', '', 3000);

                player.events.emit('playlistUpdate');

            });
            
            engine.remove( () => {
                engine.destroy();
            });
        }
        if (!files.length) {
            var droppedLink = e.dataTransfer.getData("text/plain");
            if (droppedLink) {
                if (droppedLink.startsWith('magnet:')) {
                    engine = new torrentStream(droppedLink, {
                        connections: 30
                    });
    
                    engine.ready(handleTorrent);
                } else {
                    linkUtil(droppedLink).then(url => {
                        player.notifier.info('Link Added', '', 3000);
                    }).catch(error => {
                        player.notifier.info(error.message, '', 3000);
                    });
                }
            }
            return false;
        }

        if (files.length == 1 && files[0].path) {
            if (supported.is(files[0].path, 'subs')) {
                var subs = player.itemDesc().setting.subtitles || {};
                subs[path.basename(files[0].path)] = files[0].path;
                PlayerActions.setDesc({
                    subtitles: subs
                });
                player.wcjs.subtitles.track = 0;
                SubtitleActions.loadSub(files[0].path);
                SubtitleActions.settingChange({
                    selectedSub: _.size(subs) + (player.wcjs.subtitles.count || 1),
                });
                player.notifier.info('Subtitle Loaded', '', 3000);
                return false;
            } else if (supported.is(files[0].path, 'torrent')) {

                readTorrent(files[0].path, (err, parsedTorrent) => {
                    if (err) {
                        player.notifier.info(err.message, '', 3000);
                    } else {
                        engine = new torrentStream(parsedTorrent, {
                            connections: 30
                        });
        
                        engine.ready(handleTorrent);
                    }
                });
                return false;

            }
        }

        if (parser(files[0].name).shortSzEp())
            files = sorter.episodes(files, 2);
        else
            files = sorter.naturalSort(files, 2);

        var newFiles = [];
        var queueParser = [];
        
        var itemCount = player.wcjs.playlist.itemCount;
        
        var idx = itemCount;

        var addFile = (filePath) => {
            if (supported.is(filePath, 'allMedia')) {
                newFiles.push({
                    title: parser(filePath).name(),
                    uri: 'file:///'+filePath,
                    path: filePath
                });
                queueParser.push({
                    idx: idx,
                    url: 'file:///'+filePath,
                    filename: filePath.replace(/^.*[\\\/]/, '')
                });
                idx++;
            }

            return false;
        };

        var addDir = (filePath) => {
            var newFiles = fs.readdirSync(filePath);

            if (parser(newFiles[0]).shortSzEp())
                newFiles = sorter.episodes(newFiles, 1);
            else
                newFiles = sorter.naturalSort(newFiles, 1);

            newFiles.forEach(( file, index ) => {
                var dummy = decide( path.join( filePath, file ) );
            });

            return false;
        };
        
        var decide = (filePath) => {
            if (fs.lstatSync(filePath).isDirectory())
                var dummy = addDir(filePath);
            else
                var dummy = addFile(filePath);

            return false;
        };

        _.forEach(files, el => {
            var dummy = decide(el.path);
        });

        PlayerActions.addPlaylist(newFiles);

        if (idx == itemCount)
            player.notifier.info('File Not Supported', '', 3000);
        else
            player.notifier.info('Added to Playlist', '', 3000);

        // start searching for thumbnails after 1 second
        _.delay(() => {
            queueParser.forEach( el => {
                metaParser.push(el);
            });
        },1000);

        return false;
    }
    hideUI() {
        if (!ControlStore.getState().scrobbling)
            VisibilityActions.uiShown(false);
        else
            player.hoverTimeout = setTimeout(this.hideUI, 3000);
    }
    hover(event) {
        var curPos = event.pageX+'x'+event.pageY;
        if (curPos != lastPos) {
            lastPos = curPos;
            player.hoverTimeout && clearTimeout(player.hoverTimeout);
            //this.state.uiShown || VisibilityActions.uiShown(true);
            player.hoverTimeout = setTimeout(this.hideUI, 3000);
        }
    }
    render() {
        var cursorStyle = {
            cursor: this.state.uiShown ? 'pointer' : 'none'
        };
        return '';/*(
            <div className="wcjs-player" style={cursorStyle}>
                <PlayerHeader />
                <PlayerRender />
                <Announcement />
                <SubtitleText />
                <PlayerControls />
                <Playlist />
                <Settings />
                <SubtitleList />
                <CastingMenu />
                <div className="castingBackground" />
                <ReactNotify ref='notificator'/>
            </div>
        );*/
    }
};

module.exports.player = new Player();

module.exports.playerHeader = new PlayerHeader()
module.exports.playerRender = new PlayerRender()
module.exports.announcement = new Announcement()
module.exports.subtitleText = new SubtitleText()
module.exports.playerControls = new PlayerControls()
module.exports.playList = new Playlist()
module.exports.settings = new Settings()
module.exports.subtitleList = new SubtitleList()
module.exports.castingMenu = new CastingMenu()

