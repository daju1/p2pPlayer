
var {
    dialog
}
= require('remote');
 
var alt = require('./alt');

var ModalActions = require('./components/Modal/actions');
var MainMenuActions = require('./components/MainMenu/actions');
var PlayerActions = require('./components/Player/actions');
var TorrentActions = require('./actions/torrentActions');

var sorter = require('./components/Player/utils/sort');
var parser = require('./components/Player/utils/parser');
var metaParser = require('./components/Player/utils/metaParser');
var supported = require('./utils/isSupported');

var engineStore = require('./stores/engineStore');
var ModalStore = require('./components/Modal/store');

var player = require('./components/Player/utils/player');




var _ = require('lodash');


var webUtil = require('./utils/webUtil');
//var routes = require('./routes');


webUtil.disableGlobalBackspace();

var callback_torrent_inited = function()
{
    console.log("callback_torrent_inited");
}

var callback_torrent_got_content = function(files)
{
    console.log("callback_torrent_got_content files = " + files);
    console.log("files.files_total=" + files.files_total);
}
var callback_started_torrent_dashboard = function()
{
    console.log("callback_started_torrent_dashboard");
}
var callback_torrent_ok = function()
{
    console.log("callback_torrent_ok");
}

class p2pPlayerAPI {

    open_local_torrent()
    {
        MainMenuActions.openLocal('torrent');
    }
    open_local_video()
    {
        MainMenuActions.openLocal('video');
    }
    open_torrent(fn)
    {
        TorrentActions.addTorrent(fn
            , callback_torrent_inited
            , callback_torrent_got_content
            , callback_started_torrent_dashboard
            , callback_torrent_ok);
    }

    open_magnet(url)
    {
        TorrentActions.addTorrent(url
            , callback_torrent_inited
            , callback_torrent_got_content
            , callback_started_torrent_dashboard
            , callback_torrent_ok);
    }

    get_torrent_path()
    {
        var engineState = engineStore.getState(),
            torrent = engineState.torrents[engineState.infoHash];

        if (!torrent)
            return "";

        return torrent.path;
    }

    get_torrent_files_number()
    {
        var engineState = engineStore.getState(),
            torrent = engineState.torrents[engineState.infoHash];

        if (!torrent)
            return -1;

        return torrent.files.length;
    }

    get_torrent_current_progress() {
        var engineState = engineStore.getState(),
            torrent = engineState.torrents[engineState.infoHash];

        if (!torrent)
            return;

        var fileList = [];
        var backColor = '#3e3e3e';
        var progress = torrent.torrent.pieces.downloaded / torrent.torrent.pieces.length;
        console.log("torrent_current_progress="+progress);

        var finished = false;
        if (progress == 1) {
            finished = true;
        }
        torrent.files.forEach( (el, ij) => {
            var fileProgress = Math.round(torrent.torrent.pieces.bank.filePercent(el.offset, el.length) * 100);
            console.log("torrent_current_file id = " + el.fileID);
            console.log("torrent_current_file name = " + el.name);
            console.log("torrent_current_file path = " + el.path);
            console.log("torrent_current_file length = " + el.length);
            console.log("torrent_current_file offset = " + el.offset);

            console.log("torrent_current_fileProgress="+fileProgress);
            console.log("torrent_current_file ij = "+ij);

            var fileFinished = false;
            if (finished || fileProgress >= 100) {
                fileProgress = 100;
                fileFinished = true;
            }
        })
    }

    play_now(file_index)
    {
        var engineState = engineStore.getState(),
            torrent = engineState.torrents[engineState.infoHash],
            file = torrent.files[file_index];

        if (!file)
            return;

        if (/^win/.test(process.platform)) var pathBreak = "\\";
        else var pathBreak = "/";

        var playlistItem = -1;

        for (var i = 0; i < player.wcjs.playlist.items.count; i++) {
            if (player.wcjs.playlist.items[i].mrl.endsWith('/' + file.fileID)) {
                playlistItem = i;
                break;
            }
        }

        if (playlistItem > -1) {
            player.saveState = {
                idx: playlistItem,
                position: 0
            };
        }

        //this.history.replaceState(null, 'player');

        player.wcjs.play();
    }
    play(){
        player.wcjs.play();
    }
    pause(){
        player.wcjs.pause();
    }
    stop(){
        player.wcjs.stop();
    }
    get_playlist_items_count()
    {
        return player.wcjs.playlist.items.count;
    }
    get_playlist_current_item()
    {
        return player.wcjs.playlist.currentItem;
    }
    log_playlist()
    {
        for (var i = 0; i < player.wcjs.playlist.items.count; i++) {
            console.log(player.wcjs.playlist.items[i].mrl);
        }
    }
    get_player_item_desc()
    {
        var player_item_desc = player.itemDesc();
        /*
        URL : ""
        album:""
        artist:""
        artworkURL:""
        copyright:""
        date:""
        description:""
        disabled:false
        duration:7833000
        encodedBy:""
        genre:""
        language:""
        mrl:"http://127.0.0.1:61046/0"
        nowPlaying:""
        parsed:true
        publisher:""
        rating:""
        setting:Object
            byteSize:1467893760
            idx:0
            path:"C:\Users\User\AppData\Local\Temp\p2p-Player\torrent-stream\fdf09d6fd04cf2a1ecad436ee900563ade146861\Podvig Odessi.avi"
            streamID:"0"
            title:"Podvig Odessi"
            torrentHash:"fdf09d6fd04cf2a1ecad436ee900563ade146861"
        title:"Podvig Odessi"
        trackID:""
        trackNumber:""
        */
        return player_item_desc;
    }

    get_player_item_duration()
    {
        var player_item_desc = player.itemDesc();
        return player_item_desc.duration;
    }

    get_player_item_byteSize()
    {
        var player_item_desc = player.itemDesc();
        return player_item_desc.setting.byteSize;
    }

    get_player_item_path()
    {
        var player_item_desc = player.itemDesc();
        return player_item_desc.setting.path;
    }

    get_player_item_torrentHash()
    {
        var player_item_desc = player.itemDesc();
        return player_item_desc.setting.torrentHash;
    }

    get_player_item_title()
    {
        var player_item_desc = player.itemDesc();
        return player_item_desc.title;
    }

    get_player_position()
    {
        return player.wcjs.position;
    }

    set_player_position(pos)
    {
        player.wcjs.position = pos;
    }
}

module.exports.api = new p2pPlayerAPI();