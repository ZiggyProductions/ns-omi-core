/**
 * Created by GAZ on 7/7/17.
 */
const _ = require('underscore');
module.exports = function (state, action)  {
    if(undefined === state)
        return {
            // round:0,
            // turn:0,
            // trump:0, // none, clubs, diamonds, spades, hearts
            score:{1:0,2:0}
        };
    switch (action.type) {
        case 'SET_META_ROUND': // discontinued
            var n = _.clone(state);
            n.round = action.round;
            return n;
        case 'UPDATE_SCORE':
            var n = _.clone(state);
            var drawpoint = 0;
            var score = _.reduce(action.rounds,(s,r)=>{
                if(r.cards.tricks.score[1] == r.cards.tricks.score[2]) {
                    drawpoint++;
                    return s;
                }

                if (r.cards.tricks.score[1] == 8) { // kapothi
                    s[1] += (r.first == 1 ? 3 : 4) + drawpoint;
                    drawpoint = 0;
                    return s;
                }

                if (r.cards.tricks.score[2] == 8) { // kapothi
                    s[2] += (r.first == 2 ? 3 : 4) + drawpoint;
                    drawpoint = 0;
                    return s;
                }

                if(r.cards.tricks.score[1] > r.cards.tricks.score[2]){
                    s[1] += (r.first == 1 ? 1 : 2) + drawpoint;
                    drawpoint = 0;
                    return s;
                }

                if(r.cards.tricks.score[2] > r.cards.tricks.score[1]){
                    s[2] += (r.first == 2 ? 1 : 2) + drawpoint;
                    drawpoint = 0;
                    return s;
                }
                return s;
            },{1:0,2:0});
            n.score = score;
            return n;
        default:
            return state;
    }
}

