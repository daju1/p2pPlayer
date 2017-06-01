var ModalActions = require('../components/Modal/actions');
var PlayerActions = require('../components/Player/actions');
var parser = require('../components/Player/utils/parser');
var sorter = require('../components/Player/utils/sort');
var metaParser = require('../components/Player/utils/metaParser');
var TorrentActions = require('../actions/torrentActions');
var MessageActions = require('../components/Message/actions');
var linkUtil = require('./linkUtil');
var _ = require('lodash');
var url = require('url');
var path = require('path');

var getParam = (el, arg) => {
    return el.replace(arg + '=', '').split('"').join('');
}

module.exports = {
    process: (args) => {
        if (args.length) {
//            console.log(args);
            var files = [];
            args.forEach( el => {
                if (el.startsWith('--')) {
                    // command line args
                    if (el == '--fs') {
                        window.clFullscreen = true;
                    } else if (el.startsWith('--sub-file=')) {
                        window.clSub = getParam(el, '--sub-file');
                    } else if (el.startsWith('--title=')) {
                        window.clTitle = getParam(el, '--title');
                    }
                } else {
                    if (path.isAbsolute(el)) {
                        // local file
                        if (el.endsWith('.torrent')) {
                            ModalActions.open({
                                type: 'thinking'
                            });
            
                            TorrentActions.addTorrent(el);
                        } else {
                            files.push({
                                name: parser(el).filename(),
                                path: el
                            });
                        }
                    } else if (url.parse(el).protocol) {
                        // url
                        ModalActions.open({
                            title: 'Thinking',
                            type: 'thinking'
                        });
        
                        linkUtil(el).then(url => {
                            ModalActions.close();
                        }).catch(error => {
                            ModalActions.close();
                            MessageActions.open(error.message);
                        });
                    }
                }
            });
            
            if (files.length) {
                // if local files wore found, load them

                var newFiles = [];
                var queueParser = [];
                
                if (parser(files[0].name).shortSzEp())
                    files = sorter.episodes(files, 2);
                else
                    files = sorter.naturalSort(files, 2);

                files.forEach( (file, ij) => {
                    newFiles.push({
                        title: parser(file.name).name(),
                        uri: 'file:///'+file.path,
                        path: file.path
                    });
                    queueParser.push({
                        idx: ij,
                        url: 'file:///'+file.path,
                        filename: file.name
                    });
                });

                PlayerActions.addPlaylist(newFiles);

                // start searching for thumbnails after 1 second
                _.delay(() => {
                    queueParser.forEach( el => {
                        metaParser.push(el);
                    });
                },1000);

            }
        }
    }
}