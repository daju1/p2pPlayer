var React = require('react');
var Dropzone = require('react-dropzone');

var sorter = require('./../Player/utils/sort');
var parser = require('./../Player/utils/parser');

var MainMenuActions = require('./actions');
var PlayerActions = require('../../components/Player/actions');
var ModalActions = require('./../Modal/actions');
var MessageActions = require('../Message/actions');
var TorrentActions = require('../../actions/torrentActions');
var metaParser = require('../../components/Player/utils/metaParser');
var Plugins = require('./components/Plugins');
var Settings = require('./components/Settings');
var remote = require('remote');
var path = require('path');
var fs = require('fs');
var player = require('../Player/utils/player');
var supported = require('../../utils/isSupported');
var {
    ipcRenderer
}
= require('electron');

var {
    webFrame
}
= require('electron');

var immuneToLeave = false;

var linkUtil = require('../../utils/linkUtil');

var _ = require('lodash');

module.exports = React.createClass({
    
    getInitialState() {
        return {
            dropBorderColor: '#ccc',
            lastZoom: 0,
            extensionView: false,
            settingsView: false
        }
    },
    componentWillMount() {
        immuneToLeave = false;
        window.addEventListener('resize', this.handleResize);
        var currentWindow = remote.getCurrentWindow();
        currentWindow.setMinimumSize(410, 324);
        var currentSize = currentWindow.getSize();
        if (currentSize[0] < 410) currentSize[0] = 410;
        if (currentSize[1] < 324) currentSize[1] = 324;
        currentWindow.setSize(currentSize[0], currentSize[1]);
        this.handleResize();
    },

    componentDidMount() {

    },

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    },

    handleResize() {

        var width = remote.getCurrentWindow().getSize()[0];
        var newZoom = 0;

        if (width < 407)
            newZoom = -2.3;
        else if (width >= 407 && width < 632)
            newZoom = (2.3 - ((width - 407) / 97.8)) * (-1);
        else if (width >= 632 && width < 755)
            newZoom = (width - 632) / 123;
        else
            newZoom = 1;

        if (newZoom != this.state.lastZoom) {
            this.setState({
                lastZoom: newZoom
            });
            webFrame.setZoomLevel(newZoom);
        }

    },

    onDrop(files,e) {
        if (files && files.length) {
            var ext = path.extname(files[0].path);

            if (['.torrent', '.magnet'].indexOf(ext) > -1) {

                ModalActions.open({
                    type: 'thinking'
                });

                TorrentActions.addTorrent(files[0].path);
                
            } else {

                var newFiles = [];
                var queueParser = [];
                
                if (parser(files[0].name).shortSzEp())
                    files = sorter.episodes(files, 2);
                else
                    files = sorter.naturalSort(files, 2);

                var itemCount = player && player.wcjs ? player.wcjs.playlist.itemCount : 0;
                
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

                files.forEach( (file, ij) => {
                    var dummy = decide(file.path);
                });
    
                PlayerActions.addPlaylist(newFiles);
                
                // start searching for thumbnails after 1 second
                _.delay(() => {
                    queueParser.forEach( el => {
                        metaParser.push(el);
                    });
                },1000);
            }
        } else {
            var droppedLink = e.dataTransfer.getData("text/plain");
            if (droppedLink) {

                ModalActions.open({
                    title: 'Thinking',
                    type: 'thinking'
                });

                linkUtil(droppedLink).then(url => {
                    ModalActions.close();
                }).catch(error => {
                    ModalActions.close();
                    MessageActions.open(error.message);
                });

            }
        }
        var holder = document.querySelector('.wrapper .holder');
        if (holder) holder.classList.remove('holder-hover');
    },
    onDragEnter(e,a) {
        var data = e && e.dataTransfer && e.dataTransfer.items ? e.dataTransfer.items : [];
        if (process.platform == 'darwin' && data && data.length && data[0].kind != 'file') {
            immuneToLeave = true;

            var dropDummy = document.querySelector('.dropDummy');
            dropDummy.style.display = "block";

            var dropMiddleware = (e) => {
                setTimeout(() => {
                    if (dropDummy.value) {
                        this.onDrop([], {
                            dataTransfer: {
                                getData: function() { return dropDummy.value }
                            }
                        })
                        this.onDragLeave();
                        dropDummy.style.display = "none";
                        dropDummy.value = "";
                    } else {
                        this.onDrop(e.dataTransfer.files, e)
                    }
                }, 100)
                dropDummy.removeEventListener('dragleave', leaveMiddleware)
                dropDummy.removeEventListener('drop', dropMiddleware)
            }

            var leaveMiddleware = (e) => {
                this.onDragLeave(e)
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
        var holder = document.querySelector('.wrapper .holder');
        if (holder) holder.classList.add('holder-hover');

    },
    onDragLeave(e,a) {
        if (!immuneToLeave) {
            var holder = document.querySelector('.wrapper .holder');
            if (holder) holder.classList.remove('holder-hover');
            setTimeout(() => {
                var dropDummy = document.querySelector('.dropDummy');
                dropDummy.style.display = "none";
                dropDummy.value = "";
            }, 150)
        } else {
            immuneToLeave = false;
        }
    },
    extensionView() {
        var viewHolder = window.document.querySelector(".wrapper");

        if (viewHolder.className.includes('settingsView'))
            viewHolder.className = viewHolder.className.replace(' settingsView', '');

        if (viewHolder.className.includes('extensionView')) {
            viewHolder.className = viewHolder.className.replace(' extensionView', '');
            this.setState({
                settingsView: false,
                extensionView: false
            });
        } else {
            viewHolder.className += ' extensionView';
            this.setState({
                settingsView: false,
                extensionView: true
            });
        }
    },
    settingsView() {
        var viewHolder = window.document.querySelector(".wrapper");

        if (viewHolder.className.includes('extensionView'))
            viewHolder.className = viewHolder.className.replace(' extensionView', '');

        if (viewHolder.className.includes('settingsView')) {
            viewHolder.className = viewHolder.className.replace(' settingsView', '');
            this.setState({
                extensionView: false,
                settingsView: false
            });
        } else {
            viewHolder.className += ' settingsView';
            this.setState({
                extensionView: false,
                settingsView: true
            });
        }
    },
    onTop() {
        var newValue = !player.alwaysOnTop;
        player.alwaysOnTop = newValue;
        ipcRenderer.send('app:alwaysOnTop', newValue);
        this.setState({});
    },
    render() {
        var extensionView = this.state.extensionView ? (<Plugins />) : '';
        var settingsView = this.state.settingsView ? (<Settings />) : '';
        return '';/*(
            <div className="wrapper">
               {extensionView}
               {settingsView}
               <center>
                    <Dropzone ref="dropper" disableClick={true} className="holder" onDragEnter={this.onDragEnter} onDragLeave={this.onDragLeave} onDrop={this.onDrop} style={{}}>
                        <div>
                            <div className="mainButtonHolder">
                                 <div className="inButtonHolder">
                                 
                                    <paper-icon-button id="main_on_top_but" icon="editor:publish" alt="on top" style={{color: player.alwaysOnTop ? '#00adeb' : '#767A7B', width: '47px', height: '47px', right: '2px', position: 'absolute', marginRight: '94px', marginTop: '1px', padding: '5px'}} onClick={this.onTop} />
                                    <paper-tooltip for="main_on_top_but" offset="0">Always On Top</paper-tooltip>
                                    
                                    <paper-icon-button id="main_plugins_but" icon="extension" alt="plugins" style={{color: '#767A7B', width: '44px', height: '44px', right: '3px', position: 'absolute', marginRight: '48px', marginTop: '2px'}} onClick={this.extensionView} />
                                    <paper-tooltip for="main_plugins_but" offset="0">Plugins</paper-tooltip>
                                    
                                    <paper-icon-button id="main_settings_but" icon="settings" alt="settings" style={{color: '#767A7B', width: '48px', height: '48px', right: '2px', position: 'absolute'}} onClick={this.settingsView} />
                                    <paper-tooltip for="main_settings_but" offset="0">Settings</paper-tooltip>
                                    
                                </div>
                            </div>
    
                            <img src="images/powder-logo.png" className="logoBig"/>
                            <br/>
                            <b className="fl_dd droid-bold">Drag &amp; Drop a File</b>
                            <br/>
                            <span className="fl_sl">or select an option below</span>
                            <br/>
                            <br/>
                            <div className="mainButHold">
                                <paper-button raised style={{float: 'left', width: '130px', height: '108px', background: '#00b850'}} onClick={MainMenuActions.openLocal.bind(this, 'torrent')}>
                                    <img src="images/icons/torrent-icon.png" style={{marginTop: '2px'}}/>
                                    <br/>
                                    <span className="fl_sl lbl" style={{marginTop: '11px', textTransform: 'none'}}>
                                    Add Torrent
                                    </span>
                                </paper-button>
                                <paper-button raised style={{float: 'left', width: '130px', height: '108px', background: '#1ca8ed', margin: '0 1.2em'}} onClick={MainMenuActions.openLocal.bind(this, 'video')}>
                                    <img src="images/icons/video-icon.png" style={{marginTop: '7px'}}/>
                                    <br/>
                                    <span className="fl_sl lbl" style={{marginTop: '15px', textTransform: 'none'}}>
                                    Add Video
                                    </span>
                                </paper-button>
                                <paper-button raised style={{float: 'left', width: '130px', height: '108px', background: '#f1664f'}} onClick={MainMenuActions.openURL}>
                                    <img src="images/icons/link-icon.png" style={{marginTop: '5px'}}/>
                                    <br/>
                                    <span className="fl_sl lbl" style={{marginTop: '11px', textTransform: 'none'}}>
                                    Use a URL
                                    </span>
                                </paper-button>
                            </div>
                        </div>
                    </Dropzone>
               </center>
            </div>
        );*/
    }
});