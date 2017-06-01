var {
    dialog
}
= require( 'remote');
 
var alt = require('../../alt');

var ModalActions = require('./../Modal/actions');
var PlayerActions = require('./../Player/actions');
var TorrentActions = require('../../acions/torrentActions');

var sorter = require('./../Player/utils/sort');
var parser = require('./../Player/utils/parser');
var metaParser = require('./../Player/utils/metaParser');
var supported = require('../../utils/isSupported');

var _ = require('lodash');

class MainMenuActions {

    openURL(paste = false) { // for pasting later 

        if (typeof paste !== 'string')
            ModalActions.open({
                title: 'Add URL',
                type: 'URLAdd'
            });

    }

    openLocal(type) {
        var filters;
        
        if (document.activeElement) {
            document.activeElement.blur();
        }

        switch (type) {
            case 'torrent':
                filters = [{
                    name: 'Torrents',
                    extensions: supported.ext['torrent'].map( el => { return el.substr(1).toUpperCase() })
                }]
                break;
            case 'video':
                filters = [{
                    name: 'Videos',
                    extensions: supported.ext['video'].map( el => { return el.substr(1).toUpperCase() })
                }]
                break;
        }

        dialog.showOpenDialog({
            title: 'Select file',
            properties: ['openFile', 'createDirectory', 'multiSelections'],
            filters: filters
        }, (filename) => {
            if (filename && filename.length) {
                
                if (filters[0].name == 'Videos') {
                
                    if (parser(filename[0]).shortSzEp()) {
                        filename = sorter.episodes(filename, 1);
                    } else {
                        filename = sorter.naturalSort(filename, 1);
                    }
                    
                    var newFiles = [];
                    var queueParser = [];
                    
                    filename.forEach( (file, ij) => {
                        newFiles.push({
                            title: parser(file).name(),
                            uri: 'file:///'+file,
                            path: file
                        });
                        queueParser.push({
                            idx: ij,
                            url: 'file:///'+file,
                            filename: file.replace(/^.*[\\\/]/, '')
                        });
                    });

                    PlayerActions.addPlaylist(newFiles);
                    
                    // start searching for thumbnails after 1 second
                    _.delay(() => {
                        queueParser.forEach( el => {
                            metaParser.push(el);
                        });
                    },1000);
                    
                } else if (filters[0].name == 'Torrents') {

                    ModalActions.open({
                        type: 'thinking'
                    });

                    TorrentActions.addTorrent(filename[0]);

                }
            }
        });

    }
}

module.exports = alt.createActions(MainMenuActions);