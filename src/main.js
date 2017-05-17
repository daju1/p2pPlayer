
import {
    dialog
}
from 'remote';
 
import alt from 'alt';

import ModalActions from './js/components/Modal/actions';
import MainMenuActions from './js/components/MainMenu/actions';
import PlayerActions from './js/components/Player/actions';
import TorrentActions from './js/actions/torrentActions';

import sorter from './js/components/Player/utils/sort';
import parser from './js/components/Player/utils/parser';
import metaParser from './js/components/Player/utils/metaParser';
import supported from './js/utils/isSupported';

import engineStore from './js/stores/engineStore';
import ModalStore from './js/components/Modal/store';

import player from './js/components/Player/utils/player';




import _ from 'lodash';


import webUtil from './js/utils/webUtil';
import routes from './js/routes';


webUtil.disableGlobalBackspace();


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
        TorrentActions.addTorrent(fn);
    }

    open_magnet(url)
    {
        TorrentActions.addTorrent(url);
    }

    get_torrent_path()
    {
        var engineState = engineStore.getState(),
            torrent = engineState.torrents[engineState.infoHash];

        return torrent.path;
    }

    get_torrent_files_number()
    {
        var engineState = engineStore.getState(),
            torrent = engineState.torrents[engineState.infoHash];

        return torrent.files.length;
    }

    play_now(file_index)
    {
        var engineState = engineStore.getState(),
            torrent = engineState.torrents[engineState.infoHash],
            file = torrent.files[file_index];

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
            path:"C:\Users\User\AppData\Local\Temp\Powder-Player\torrent-stream\fdf09d6fd04cf2a1ecad436ee900563ade146861\Podvig Odessi.avi"
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
