var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0, descriptor; i < props.length; i++) {
            descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || !1;
            descriptor.configurable = !0;
            if ("value" in descriptor) descriptor.writable = !0;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

module.exports.createClass = _createClass;
module.exports.interopRequireDefault = _interopRequireDefault;
module.exports.classCallCheck = _classCallCheck;
