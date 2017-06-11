var React = require('react');
var {
    Router, Route, IndexRoute
}
= require('react-router');
var Framework = require('./components/Framework.react');

var MainMenu = require('./components/MainMenu');
var Preferences = require('./components/Preferences');
var player = require('./components/Player');
var TorrentDashboard = require('./components/TorrentDashboard');

module.exports.framework = new Framework();
module.exports.mainMenu = new MainMenu();
module.exports.preferences = new Preferences();
module.exports.player = player;
module.exports.torrentDashboard = new TorrentDashboard();