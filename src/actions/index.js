module.exports = {
    addRound: function () {
        return {type: 'ADD_ROUND'}
    },
    addPlayer: function (player) {
        return {
            type: 'ADD_PLAYER',
            player: player
        }
    }
}

