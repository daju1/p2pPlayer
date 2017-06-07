var alt = require('../../../../../../alt');
var helper = require('../../../../../../helper');
var _ = require('lodash');
var ls = require('local-storage');
var player = require('../../../../utils/player');

var throttlers = {};

var VolumeActions = function() {

    function VolumeActions() {
        helper.classCallCheck(this, VolumeActions);
        this.generateActions(
            'settingChange'
        );
    }
    
    helper.createClass(VolumeActions, [{
    key: 'handleVolume',
    value: function 
    handleVolume() {
        var t = document.querySelector('.vol-slide').immediateValue;
        if (!throttlers.volume)
            throttlers.volume = _.throttle(this.actions.setVolume, 100);
        throttlers.volume(t);
    }

    }, {
    key: 'setVolume',
    value: function 
    setVolume(t) {

        if (t > 200) // don't allow volume higher than 200%
            t = 200;

        if (t < 0)
            t = 0;

        var wcjs = player.wcjs,
            obj = {},
            volumeState = this.alt.stores.VolumeStore.state;

        if (volumeState.muted) {
            if (wcjs)
                wcjs.mute = false;
            obj.muted = false;
        }

        obj.volume = t;

        this.actions.settingChange(obj);

        if (wcjs)
            wcjs.volume = t;

        if (!volumeState.volumeDragging)
            ls('volume', t);
    }

    }, {
    key: 'handleMute',
    value: function 
    handleMute(event) {
        var volumeState = this.alt.stores.VolumeStore.state;
        this.actions.mute(!volumeState.muted);
    }

    }, {
    key: 'mute',
    value: function 
    mute(mute) {
        var wcjs = player.wcjs;

        if (wcjs)
            wcjs.mute = mute;

        this.actions.settingChange({
            muted: mute
        });
    }

    }, {
    key: 'volumeIndexEffect',
    value: function 
    volumeIndexEffect(f, b, i) {
        if (i) {
            var volumeState = this.alt.stores.VolumeStore.state;
            if (!volumeState.volumeDragging) {
//                  document.querySelector('.vol-slide .sliderKnob').style.opacity = 0;
//                var volumeIndex = volumeState.volumeSlider.refs['track'].lastChild;
//                var volumeClass = volumeIndex.className.replace(' volume-hover', '');
                var knob = document.querySelector('.vol-slide #sliderKnob');
                if (i.type == 'react-mouseenter')
                    knob.style.transform = 'scale(1.0)';
                else if (i.type == 'react-mouseleave')
                    knob.style.transform = 'scale(0)';

            } else if (i.type) {
                this.actions.settingChange({
                    volumePendingEffects: i.type
                })
            }
        }
    }

    }, {
    key: 'volumeRippleEffect',
    value: function 
    volumeRippleEffect(c, i, a) {
//        if (a) {
//            var volumeState = this.alt.stores.VolumeStore.state;
//            if (!volumeState.volumeDragging) {
//                var volumeRipple = volumeState.volumeSlider.refs['track'].lastChild.firstChild;
//                var volumeClass = volumeRipple.className.replace(' volume-ripple-hover', '');
//                if (a.type == 'react-mouseenter')
//                    volumeRipple.className = volumeClass;
//                else if (a.type == 'react-mouseleave')
//                    volumeRipple.className = volumeClass + ' volume-ripple-hover';
//
//            } else if (a.type) {
//                this.actions.settingChange({
//                    volumePendingRipples: a.type
//                });
//            }
//        }
    }

    }, {
    key: 'volumeDragStart',
    value: function 
    volumeDragStart() {
        this.actions.settingChange({
            volumeDragging: true
        });
    }

    }, {
    key: 'volumeDragStop',
    value: function 
    volumeDragStop() {
        document.querySelector('.vol-slide').blur();
        var obj = {
            volumeDragging: false
        };
        var volumeState = this.alt.stores.VolumeStore.state;
        if (volumeState.volumePendingEffects) {
            this.actions.volumeIndexEffect(null, null, {
                type: volumeState.volumePendingEffects
            });
            obj.volumePendingEffects = '';
        }
//        if (volumeState.volumePendingRipples) {
//            this.actions.volumeRippleEffect(null, null, {
//                type: volumeState.volumePendingRipples
//            });
//            obj.volumePendingRipples = '';
//        }
        this.actions.settingChange(obj);
        ls('volume', volumeState.volume);

    }
    }]);
    return VolumeActions;

}


module.exports = alt.createActions(VolumeActions);
