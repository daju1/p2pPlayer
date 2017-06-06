var alt = require('../../alt');
var helper = require('../../helper');

var _ = require('lodash');
var {
    ipcRenderer
}
= require('electron');
var HistoryStore = require('../../stores/historyStore');
var torrentUtil = require('../../utils/stream/torrentUtil');
var player = require('./utils/player');
var ls = require('local-storage');
var wcjsRenderer = require('./utils/wcjs-renderer');

var PlayerActions = function() {
    function PlayerActions() {
        helper.classCallCheck(this, PlayerActions);
    }

    helper.createClass(PlayerActions, [{
        key: 'announcement',
        value: function announcement(obj) {

        var announcer = {};
        if (typeof obj === 'string') obj = {
            text: obj
        };
        announcer.text = obj.text;
        if (!obj.delay) obj.delay = 2000;

        clearTimeout(player.announceTimer);
        player.announceTimer = setTimeout(() => {
            if (!player.announceEffect) {
                player.events.emit('announce', {
                    effect: !player.announceEffect
                });
            }
        }, obj.delay);

        if (player.announceEffect)
            obj.effect = !player.announceEffect;

        if (Object.keys(announcer).length)
            player.events.emit('announce', obj);
    }

    }, {
        key: 'setDesc',
        value: function setDesc(obj) {

        var playerState = this.alt.stores.playerStore.getState();
        var wcjs = player.wcjs;
        if (typeof obj.idx === 'undefined')
            obj.idx = wcjs.playlist.currentItem;

        if (obj && typeof obj.idx === 'number') {
            var i = obj.idx;

            if (obj.title)
                wcjs.playlist.items[i].title = obj.title;

            if (i > -1 && i < wcjs.playlist.items.count) {
                if (wcjs.playlist.items[i].setting.length)
                    var wjsDesc = JSON.parse(wcjs.playlist.items[i].setting);
                else
                    var wjsDesc = {};

                if (obj)
                    for (var key in obj)
                        if (obj.hasOwnProperty(key))
                            wjsDesc[key] = obj[key];

                wcjs.playlist.items[i].setting = JSON.stringify(wjsDesc);
            }
        }
    }
    
    }, {
        key: 'addPlaylist',
        value: function addPlaylist(data) {

        if (!player.wcjs) {
            player.wcjsInit();
        }
        var selected = -1,
            noStart = false;
        if (data.selected) {
            selected = data.selected;
            data = data.files;
        }
        if (data.noStart) {
            noStart = true;
            data = data.files;
        } else if (!player.wcjs.playlist.itemCount) {
            HistoryStore.getState().history.replaceState(null, 'player');
        }

        var playerState = this.alt.stores.playerStore.getState();
        var wcjs = player.wcjs;

        if (!wcjs) {
            if (data.length)
                player.set({
                    pendingFiles: data,
                    files: player.files.concat(data),
                    pendingSelected: selected
                });
        } else {

            player.set({
                files: player.files.concat(data)
            });

            if (wcjs.playlist.items.count == 0)
                var playAfter = true;

            for (var i = 0; data[i]; i++) {
                if (typeof data[i] === 'string') {
                    wcjs.playlist.add(data[i]);
                    wcjs.playlist.items[wcjs.playlist.items.count - 1].parseAsync();
                } else if (data[i].uri) {
                    wcjs.playlist.add(data[i].uri);
                    if (data[i].title)
                        wcjs.playlist.items[wcjs.playlist.items.count - 1].title = data[i].title;

                    wcjs.playlist.items[wcjs.playlist.items.count - 1].parseAsync();

                    data[i].idx = wcjs.playlist.items.count - 1;

                    let keeper = data[i];

                    if (window.clTitle) {
                        keeper.title = window.clTitle;
                        delete window.clTitle;
                    }

                    if (data[i].byteSize && data[i].torrentHash) {
                        this.actions.setDesc({
                            idx: keeper.idx,
                            byteSize: keeper.byteSize,
                            torrentHash: keeper.torrentHash,
                            streamID: keeper.streamID,
                            path: keeper.path,
                            title: keeper.title ? keeper.title : null
                        });
                    } else if (data[i].path) {
                        this.actions.setDesc({
                            idx: keeper.idx,
                            path: keeper.path,
                            title: keeper.title ? keeper.title : null
                        });
                    } else if (data[i].youtubeDL) {
                        this.actions.setDesc({
                            idx: keeper.idx,
                            timestamp: 0,
                            youtubeDL: true,
                            originalURL: keeper.originalURL,
                            image: keeper.image ? keeper.image : null,
                            title: keeper.title ? keeper.title : null
                        });
                    } else if (data[i].filmon) {
                        this.actions.setDesc({
                            idx: keeper.idx,
                            filmon: true,
                            filmonObj: keeper.filmonObj,
                            image: keeper.image ? keeper.image : null,
                            title: keeper.title ? keeper.title : null
                        });
                    }

                }
            }

            if (!noStart) {
                if (selected > -1) {
                    wcjs.playlist.playItem(selected);
                } else if (playAfter) wcjs.playlist.playItem(0);
            }

        }
    }

    }, {
        key: 'replaceMRL',
        value: function replaceMRL(newObj) {

        var progressState = this.alt.stores.ProgressStore.getState();
        var wcjs = player.wcjs;

        var newX = newObj.x;
        var newMRL = newObj.mrl;

        player.set({
            files: player.files.concat([newMRL])
        });

        wcjs.playlist.add(newMRL.uri);
        wcjs.playlist.items[wcjs.playlist.items.count - 1].parseAsync();
        if (newMRL.title)
            wcjs.playlist.items[wcjs.playlist.items.count - 1].title = newMRL.title;

        var newDifference = wcjs.playlist.items.count - 1;
        var swapDifference = wcjs.playlist.items.count - newX - 1;

        if (newX == wcjs.playlist.currentItem && [3, 4].indexOf(wcjs.state) > -1) {
            var playerPos = progressState.position;
            wcjs.stop();
            wcjs.playlist.advanceItem(newDifference, swapDifference * (-1));
            wcjs.playlist.playItem(newX);
            wcjs.position = playerPos;

        } else wcjs.playlist.advanceItem(newDifference, swapDifference * (-1));

        wcjs.playlist.items[newX].setting = wcjs.playlist.items[newX + 1].setting;
        wcjs.playlist.removeItem(newX + 1);

        var newData = {};
        
        newData.title = newMRL.title ? newMRL.title : null;
            
        newData.image = newMRL.thumbnail ? newMRL.thumbnail : null;
        
        if (newMRL.youtubeDL)
            newData.timestamp = new Date().getTime();
        
        if (newData.title || newData.image || newData.timestamp) {
            newData.idx = newX;
            this.actions.setDesc(newData);
        }
        
        if (newMRL.byteSize) newData.byteSize = newMRL.byteSize
        if (newMRL.streamID) newData.streamID = newMRL.streamID
        if (newMRL.path) newData.path = newMRL.path
        if (newMRL.torrentHash) newData.torrentHash = newMRL.torrentHash

        if (newObj.autoplay)
            wcjs.playlist.playItem(newObj.x);
    }

    }, {
        key: 'pulse',
        value: function pulse() {
        var wcjs = player.wcjs;

        if (wcjs) {
            var length = wcjs.length;
            var itemDesc = player.itemDesc();
            if (length && itemDesc.setting && itemDesc.setting.torrentHash && itemDesc.setting.byteSize) {
                var newPulse = Math.round(itemDesc.setting.byteSize / (length / 1000) * 2);
                torrentUtil.setPulse(itemDesc.setting.torrentHash, newPulse);
            }
        }
    }

    }, {
        key: 'flood',
        value: function flood() {

        var wcjs = player.wcjs;

        if (wcjs) {
            var itemDesc = player.itemDesc();
            if (itemDesc.setting && itemDesc.setting.torrentHash)
                torrentUtil.flood(itemDesc.setting.torrentHash);
        }
    }

    }, {
        key: 'updateImage',
        value: function updateImage(image) {

        if (document.getElementById('canvasEffect')) {
            var wcjs = player.wcjs;
            if (!wcjs.input.hasVout && image) {
                var image = image.replace('large', 't500x500');
                document.getElementById('canvasEffect').parentNode.style.cssText = "background-color: transparent !important";
                document.getElementById('playerCanvas').style.display = "none";
                document.getElementsByClassName('wcjs-player')[0].style.background = "url('" + image + "') 50% 50% / contain no-repeat black";
            } else {
                document.getElementById('canvasEffect').parentNode.style.cssText = "background-color: #000 !important";
                document.getElementById('playerCanvas').style.display = "block";
                document.getElementsByClassName('wcjs-player')[0].style.background = "black";
                _.defer(() => {
                    player.events.emit('resizeNow');
                });
            }
        }
    }

    //toggleAlwaysOnTop(state = true) {
    }, {
         key: 'toggleAlwaysOnTop',
        value: function toggleAlwaysOnTop() {
            var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : !0;
        ipcRenderer.send('app:alwaysOnTop', state);
    }

    //togglePowerSave(state = true) {
    }, {
        key: 'togglePowerSave',
        value: function togglePowerSave() {
            var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : !0;
        ipcRenderer.send('app:powerSaveBlocker', state);
    }

    }]);
    return PlayerActions;
}();


module.exports = alt.createActions(PlayerActions);
