﻿var React = require('react');
var _ = require('lodash');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var ls = require('local-storage');

var PlayerActions = require('../actions');
var SubtitleStore = require('./SubtitleText/store');
var SubtitleActions = require('./SubtitleText/actions');
var VisibilityStore = require('./Visibility/store');
var VisibilityActions = require('./Visibility/actions');
var player = require('../utils/player');
var path = require('path');

const lang2country = {
    en: 'us',
    cs: 'cz',
    pb: 'br',
    he: 'il',
    el: 'gr',
    uk: 'ua',
    fa: 'ir',
    vi: 'vn'
}

module.exports = React.createClass({

    mixins: [PureRenderMixin],

    getInitialState() {
        return {
            open: false,
            playlist: player.wcjs.playlist || false,
            playlistSelected: SubtitleStore.getState().selectedSub
        }
    },
    componentWillMount() {
        VisibilityStore.listen(this.update);
    },

    componentWillUnmount() {
        VisibilityStore.unlisten(this.update);
    },
    update() {
        if (this.isMounted()) {
            this.setState({
                open: VisibilityStore.getState().subtitles,
                playlist: player.wcjs.playlist || false,
                playlistSelected: SubtitleStore.getState().selectedSub
            });
        }
    },

    close() {
        PlayerActions.openPlaylist(false);
    },

    getItems() {
        var itemDesc = player.itemDesc();
        if (itemDesc && itemDesc.setting && itemDesc.setting.subtitles) {
            return itemDesc.setting.subtitles;
        } else return [];
    },
    
    select(idx, item, itemId) {
        ls('lastLanguage', idx);
        player.wcjs.subtitles.track = 0;
        if (item) {
            SubtitleActions.loadSub(item);
            SubtitleActions.settingChange({
                selectedSub: itemId,
            });
        } else {
            SubtitleActions.settingChange({
                selectedSub: itemId,
                subtitle: [],
                trackSub: -1,
                text: ''
            });
        }
        VisibilityActions.settingChange({
            subtitles: false
        });
    },

    selectInternal(idx, item, itemId) {
        var wcjs = player.wcjs;
        if (item && (itemId - 1) < wcjs.subtitles.count) {
            wcjs.subtitles.track = idx;
            SubtitleActions.settingChange({
                selectedSub: itemId,
                subtitle: [],
                subText: ''
            });
            VisibilityActions.settingChange({
                subtitles: false
            });
        }
    },

    getInternalSubs() {
        var wcjs = player.wcjs;
        var internalSubs = [];
        if (wcjs.subtitles && wcjs.subtitles.count > 0) {
            for (var i = 1; i < wcjs.subtitles.count; i++)
                internalSubs.push(wcjs.subtitles[i]);
            return internalSubs;
        } else return [];
    },

    render() { return ''; /*
        var itemId = 1;
        if (!ls.isSet('menuFlags') || ls('menuFlags')) {
            var none = (
                <paper-item key={itemId} style={{backgroundColor: '#303030', color: 'white', padding: '4px 12px'}} onClick={this.select.bind(this, 'none', '', 1)} className={'sub-menu-item' + (this.state.playlistSelected == itemId ? ' iron-selected' : '')}>
                      <span style={{width: '38px', height: '38px', borderRadius: '25px', backgroundColor: '#242424', margin: '4px', marginLeft: '0', marginRight: '15px'}} />
                    <paper-item-body>
                    None
                    </paper-item-body>
                </paper-item>
            );
        } else {
            var none = (
                <paper-item key={itemId} style={{backgroundColor: '#303030', color: 'white', padding: '4px 22px'}} onClick={this.select.bind(this, 'none', '', 1)} className={'sub-menu-item' + (this.state.playlistSelected == itemId ? ' iron-selected' : '')}>
                <paper-item-body>
                    None
                </paper-item-body>
                </paper-item>
            );
        }
        return ( 
            <div className={this.state.open ? 'subtitle-list show' : 'subtitle-list'}>
            <div style={{backgroundColor: '#303030', padding: '0'}}>
                {none}
                {
                        _.map(this.getInternalSubs(), (item, idx) => {
                            itemId++;
                            if (!ls.isSet('menuFlags') || ls('menuFlags')) {
                                return (
                                  <paper-item key={itemId} style={{backgroundColor: '#303030', color: 'white', padding: '4px 12px'}} onClick={this.selectInternal.bind(this, (idx + 1), item, itemId)} className={'sub-menu-item' + (this.state.playlistSelected == itemId ? ' iron-selected' : '')}>
                                  <span style={{width: '38px', height: '38px', borderRadius: '25px', backgroundImage: 'url(./images/icons/internal-subtitle-icon.png)', margin: '4px', marginLeft: '0', marginRight: '15px', backgroundSize: 'cover', backgroundPosition: 'center'}} />
                    <paper-item-body>
                                    {item}
                                    </paper-item-body>
                                  </paper-item>
                                );
                            } else {
                                return (
                                  <paper-item key={itemId} style={{backgroundColor: '#303030', color: 'white', padding: '4px 22px'}} onClick={this.selectInternal.bind(this, (idx + 1), item, itemId)} className={'sub-menu-item' + (this.state.playlistSelected == itemId ? ' iron-selected' : '')}>
                                    <paper-item-body>
                                    {item}
                                    </paper-item-body>
                                  </paper-item>
                                );
                            }
                        })
                    }
                    {
                        _.map(this.getItems(), (item, idx) => {
                            itemId++;
                            var lang = idx.split('[lg]');
                            if (lang2country[lang[1]]) lang[1] = lang2country[lang[1]];
                            if (!ls.isSet('menuFlags') || ls('menuFlags')) {
                                return (
                                  <paper-item key={itemId} style={{backgroundColor: '#303030', color: 'white', padding: '4px 12px'}} onClick={this.select.bind(this, idx, item, itemId)} className={'sub-menu-item' + (this.state.playlistSelected == itemId ? ' iron-selected' : '')}>
                                      <span key={itemId} style={{width: '38px', height: '38px', borderRadius: '25px', backgroundImage: 'url(' + (lang[1] ? 'http://flagpedia.net/data/flags/small/' + lang[1] : 'images/icons/external-subtitle-icon') + '.png)', margin: '4px', marginLeft: '0', marginRight: '15px', backgroundSize: 'cover', backgroundPosition: 'center'}} />
                                    <paper-item-body style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: '1', WebkitBoxOrient: 'vertical', maxWidth: '192px' }}>
                                    {lang[0]}
                                    </paper-item-body>
                                  </paper-item>
                                );
                            } else {
                                return (
                                  <paper-item key={itemId} style={{backgroundColor: '#303030', color: 'white', padding: '4px 22px' }} onClick={this.select.bind(this, idx, item, itemId)} className={'sub-menu-item' + (this.state.playlistSelected == itemId ? ' iron-selected' : '')}>
                                    <paper-item-body style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: '1', WebkitBoxOrient: 'vertical', maxWidth: '192px' }}>
                                    {lang[0]}
                                    </paper-item-body>
                                  </paper-item>
                                );
                            }
                        })
                    }
            </div>
            </div>
        );*/
    }

    
});