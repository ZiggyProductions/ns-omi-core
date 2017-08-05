'use strict';

var _ = require('underscore');

module.exports = function (state, action) {
    if (undefined === state) return [];
    switch (action.type) {
        case 'ADD_PLAYER':
            if (state.length >= 4) return state;else {

                if (_.find(state, function (p) {
                    return p.id === action.player.id;
                })) return state;else return state.concat({ id: action.player.id });
            }
        default:
            return state;
    }
};
//# sourceMappingURL=player.js.map