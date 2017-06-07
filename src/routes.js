var React = require('react');
var {
    Router, Route, IndexRoute
}
= require('react-router');
var Framework = require('./components/Framework.react');

var MainMenu = require('./components/MainMenu');
var Preferences = require('./components/Preferences');
var Player = require('./components/Player');
var TorrentDashboard = require('./components/TorrentDashboard');


module.exports = {
    /*<Route path="/" component={Framework}>
      <IndexRoute component={MainMenu}/>

      <Route path="torrentDashboard" component={TorrentDashboard}/>
      
      <Route path="preferences" component={Preferences}/>
      <Route path="player" component={Player}/>
    </Route>*/
}