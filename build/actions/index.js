'use strict';

module.exports = {
    addRound: function addRound() {
        return { type: 'ADD_ROUND' };
    },
    addPlayer: function addPlayer(player) {
        return {
            type: 'ADD_PLAYER',
            player: player
        };
    }
};
//# sourceMappingURL=index.js.map