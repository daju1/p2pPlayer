var React = require('react');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var {
    RouteContext, History
}
= require('react-router');
var {
    ipcRenderer
}
= require('electron');
var {
    mouseTrap
}
= require('react-mousetrap');
var {
    app
} = require('remote');
var plugins = require('../utils/plugins');
var Modal = require('./Modal');
var DarkModal = require('./Player/components/Modal');
var Message = require('./Message');
var Header = require('./Header');
var historyActions = require('../actions/historyActions');
var traktUtil = require('./Player/utils/trakt');
var filmonUtil = require('./Player/utils/filmon');
var request = require('request');
var subUtil = require('./Player/utils/subtitles');
var updater = require('./Player/utils/updates');
var remote = require('remote');
var clArgs = require('../utils/clArgs');
var setDefaults = require('../utils/defaults');
var ls = require('local-storage');
var Promise = require('bluebird');
var _ = require('lodash');

var attachArgs = true;

var passArgs = function(e, args) {
    if (args.startsWith('[')) {
        JSON.parse(args).forEach(arg => {
            clArgs.process([arg]);
        })
        ipcRenderer.removeListener('cmdline', passArgs)
    } else {
        clArgs.process([args]);
        ipcRenderer.send('app:cmdline');
    }
}

const Framework = React.createClass({

    mixins: [PureRenderMixin, RouteContext, History],

    componentWillMount() {

        plugins.update();

        Promise.config({
            warnings: {
                wForgottenReturn: false
            }
        });

        updater.checkUpdates();

        setDefaults();

        filmonUtil.init();

        this.props.bindShortcut('ctrl+d', () => ipcRenderer.send('app:toggleDevTools'));

        window.addEventListener('mouseup', function() {
            // removes polymer's element focus which hijacks my enter / space hotkeys
            _.delay(() => {
                if (document.activeElement.tagName != "INPUT")
                    document.querySelector('body').focus();
            }, 500);
        });

        subUtil.fetchOsCookie(true);

        historyActions.history(this.history);
        this.history.listen(this.updatehistory);
    },

    componentDidMount() {
        ipcRenderer.send('app:startup', new Date().getTime());

        request('https://www.google.com'); // Connect once to avoid cloggage

        // login trakt
        if (ls('traktTokens'))
            traktUtil.autoLogin();

        if (remote.process.argv.length > 1) {
            // load command line args
            var args = remote.process.argv;
            args.shift();
            clArgs.process(args);
        }

        if (attachArgs) {
            attachArgs = false;
            app.on('open-file', passArgs);
            app.on('open-url', passArgs);
        }
        ipcRenderer.send('app:cmdline');
        ipcRenderer.on('cmdline', passArgs);


        // analytics
        var ua = require('universal-analytics');
        if (!ls('cid')) {
            var visitor = ua('UA-65979437-4');
            ls('cid', visitor.cid);
        } else {
            var visitor = ua('UA-65979437-4', ls('cid'));
        }
        visitor.pageview("/").send();
    },

    componentWillUnmount() {
        ipcRenderer.removeListener('cmdline', passArgs);
        window.removeEventListener('resize', this.handleResize);
    },

    updatehistory() {
        historyActions.history(this.history);
    },

    render() {
        return '';/*(
            <div id="main">
              <textarea className="dropDummy" style={{ display: 'none', position: 'absolute', top: '0', right: '0', left: '0', bottom: '0', width: '100%', zIndex: '1000', opacity: '0' }} />
              <Header/>
              {React.cloneElement(this.props.children, {query: this.props.query})}
              <Modal />
              <DarkModal />
              <Message />
              <canvas id="fake-canvas" style={{display: 'none'}} />
            </div>
        );*/
    }
});

module.exports = mouseTrap(Framework)