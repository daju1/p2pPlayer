var alt = require('../alt');
var ModalActions = require('../components/Modal/actions');
var _ = require( 'lodash');

var helper = require('../helper');
var path = require('path');
var {
    ipcRenderer
}
= require('electron');
var ls = require('local-storage');
var parser = require('../components/Player/utils/parser');
var player = require('../components/Player/utils/player');
var metaParser = require('../components/Player/utils/metaParser');

var torrentActions = function() {
    function torrentActions() {
        helper.classCallCheck(this, torrentActions);
        this.generateActions('add', 'clear');
    }
    helper.createClass(torrentActions, [{

        key: 'addTorrent',
        value: function addTorrent(torrent, 
            callback_torrent_inited, 
            callback_torrent_got_content, 
            callback_started_torrent_dashboard, 
            callback_torrent_ok)
    {
        var TorrentUtil = require('../utils/stream/torrentUtil');
        this.dispatch();
        TorrentUtil.init(torrent)
            .then((instance) => {
                ModalActions.metaUpdate({
                    type: 'torrent',
                    data: instance
                });

                process.nextTick(function () {
                    callback_torrent_inited();
                });
                return instance;
            })
            .then((instance) => {
                this.actions.add(instance);

                var engineStore = require('../stores/engineStore');
                if (!engineStore.state.torrents[instance.infoHash]['stream-port']) {
                    return new Promise((resolve) => {
                        instance.on('listening', function() {
                            resolve(instance);
                        });
                    });
                } else {
                    return instance;
                }
            })
            .then((instance) => {
                return TorrentUtil.getContents(instance.files, instance.infoHash);
            })
            .then((files) => {
               process.nextTick(function () {
                   callback_torrent_got_content(files);
               });
               if (ls('askFiles') && files.files_total > 1) {
                    ModalActions.fileSelector(files);
                    ipcRenderer.send('app:bitchForAttention');
                } else {
                    var fileSelectorData = _.omit(files, ['files_total', 'folder_status']);
                    var folder = fileSelectorData[Object.keys(fileSelectorData)[0]];
                    var file = folder[Object.keys(folder)[0]];
                    var newFiles = [];
                    var queueParser = [];
                    var engineStore = require('../stores/engineStore');

                    if (files.ordered.length) {
                        files.ordered.forEach( (file, ij) => {
                            if (file.name.toLowerCase().replace("sample","") == file.name.toLowerCase() && file.name != "ETRG.mp4" && file.name.toLowerCase().substr(0,5) != "rarbg") {
                                newFiles.push({
                                    title: parser(file.name).name(),
                                    uri: 'http://127.0.0.1:' + engineStore.state.torrents[file.infoHash].server.address().port + '/' + file.id,
                                    byteSize: file.size,
                                    torrentHash: file.infoHash,
                                    streamID: file.id,
                                    path: file.path
                                });
                                queueParser.push({
                                    idx: ij,
                                    url: 'http://127.0.0.1:' + engineStore.state.torrents[file.infoHash].server.address().port + '/' + file.id,
                                    filename: file.name
                                });
                            }
                        });
                    }
                    // TODO fix ls_downloadType is null 
                    var ls_downloadType = ls('downloadType'); 
                    var ls_playerType = ls('playerType'); 
                    var ls_playerPath = ls('playerPath'); 

                    var PlayerActions = require('../components/Player/actions');
                    if (ls_downloadType == 0 && !ls_playerType) {
                        // start with internal player
                        PlayerActions.addPlaylist(newFiles);
                    } else if (ls_downloadType == 1 || ls_playerType || null == ls_downloadType) {
                        if (ls_playerType && ls_playerPath) {
                            // start with external player
                            // player.generatePlaylist(newFiles);
                        }
                        // start torrent dashboard
                        var newData = { noStart: true, files: newFiles };

                        PlayerActions.addPlaylist(newData);

                        var historyStore = require('../stores/historyStore');
                        var state = historyStore.getState();
                        if (state.history)
                            state.history.replaceState(null, 'torrentDashboard');
                        else
                            console.warn('historyStore.getState().history is false');


                        process.nextTick(function () {
                            callback_started_torrent_dashboard();
                        });
                    }


                    // start searching for thumbnails after 1 second
                    _.delay(() => {
                        if (queueParser.length) {
                            queueParser.forEach( el => {
                                metaParser.push(el);
                            });
                        }
                        process.nextTick(function () {
                            callback_torrent_ok();
                        });
                    },1000);

                    ModalActions.close();
                }
            })
            .catch(err => {
                //ModalActions.close();
                console.error(err);
            });
        }
    }]);
    return torrentActions;
}();
module.exports = alt.createActions(torrentActions);