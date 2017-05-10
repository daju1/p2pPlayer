
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

    play_now()
    {
        var engineState = engineStore.getState(),
            modalState = ModalStore.getState(),
            torrent = engineState.torrents[engineState.infoHash],
            file = torrent.files[0];//modalState.index];

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
    stop(){
        player.wcjs.stop();
    }
}
