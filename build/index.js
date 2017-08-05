"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createCore = exports.omiCore = exports.storage = exports.defaults = undefined;

var _redux = require('redux');

var _storage = require('./services/storage');

var _storage2 = _interopRequireDefault(_storage);

var _nodeUuid = require('node-uuid');

var _defaults = require('./defaults');

var _defaults2 = _interopRequireDefault(_defaults);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createCore = async function createCore() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var _Object$assign = Object.assign({}, _defaults2.default, options),
        room = _Object$assign.room,
        path = _Object$assign.path;

    _storage2.default.room = room;
    _storage2.default.path = path;
    var reducers = {
        players: require('./reducers/player'),
        rounds: require('./reducers/round'),
        meta: require('./reducers/meta')
    };
    var store = (0, _redux.createStore)((0, _redux.combineReducers)(reducers), (await _storage2.default.loadState()));
    store.subscribe(function () {
        _storage2.default.saveState(store.getState());
    });
    return store;
};

var defaultCore = function defaultCore() {
    return createCore()({ room: (0, _nodeUuid.v4)() });
};

exports.defaults = _defaults2.default;
exports.storage = _storage2.default;
exports.omiCore = defaultCore;
exports.createCore = createCore;
exports.default = defaultCore;
//# sourceMappingURL=index.js.map