/**
 * Created by GAZ on 7/7/17.
 */
"use strict";

var _ = require('underscore');

var cardweights = { '7': 1, '8': 2, '9': 3, '1': 4, 'J': 5, 'Q': 6, 'K': 7, 'A': 8 };

var round = function round(state, action) {
    switch (action.type) {
        case 'INIT_ROUND':
            return _.isEmpty(state) ? { cards: initDeck(action), first: action.first, current: action.first } : state;
        case 'SET_TRUMPH':
            return _.extend({ trumph: action.trumph }, state);
        case 'SHIFT_TURN':
            return shiftTurn(state);
        case 'PREVALIDATE':
        case 'DEAL':
        case 'PLAY_ANY':
            action.trumph = state.trumph;
            action.current = state.current;
            var n = _.clone(state);
            n.cards = cards(n.cards, action);
            return n;
        case 'PLAY-SHIFT-PREVALIDATE':
            var n = _.clone(state);
            var sub_action = { trumph: n.trumph, current: n.current, type: 'PLAY_ANY', player: action.player };
            n.cards = cards(n.cards, sub_action);
            var nn = shiftTurn(n);
            //console.log(nn.current,nn.cards);

            sub_action = { trumph: nn.trumph, current: nn.current, type: 'PREVALIDATE' };
            nn.cards = cards(nn.cards, sub_action);
            return nn;

        default:
            return state;
    }
};

var cards = function cards(state, action) {
    switch (action.type) {
        case 'DEAL':
            return deal(state, action.count);
        case 'PREVALIDATE':
            return prevalidate(state, action);
        case 'PLAY_ANY':
            return playAny(state, action);
        default:
            return state;
    }
};

function initDeck(action) {
    "use strict";

    if (action.test) {
        return {
            deck: [],
            pc: action.test,
            trick: {}
        };
    } else {
        return {
            deck: _.shuffle(['♣7', '♣8', '♣9', '♣10', '♣J', '♣Q', '♣K', '♣A', '♦7', '♦8', '♦9', '♦10', '♦J', '♦Q', '♦K', '♦A', '♠7', '♠8', '♠9', '♠10', '♠J', '♠Q', '♠K', '♠A', '♥7', '♥8', '♥9', '♥10', '♥J', '♥Q', '♥K', '♥A']),
            trick: {}
        };
    }
}

function deal(cards, n) {
    if (cards.pc) {
        var pc = {
            _1: cards.pc._1.concat(cards.deck.slice(0, n)),
            _2: cards.pc._2.concat(cards.deck.slice(n, 2 * n)),
            _3: cards.pc._3.concat(cards.deck.slice(2 * n, 3 * n)),
            _4: cards.pc._4.concat(cards.deck.slice(3 * n, 4 * n))
        };
    } else {
        var pc = {
            _1: cards.deck.slice(0, n),
            _2: cards.deck.slice(n, 2 * n),
            _3: cards.deck.slice(2 * n, 3 * n),
            _4: cards.deck.slice(3 * n, 4 * n)
        };
    }

    return _.extendOwn(cards, {
        pc: pc,
        deck: _.difference(cards.deck, pc._1, pc._2, pc._3, pc._4)
    });
}

function playAny(cards, action) {
    // not his turn
    if (action.current !== action.player) {
        console.error('MISSTURN', action.current, action.player);
        return cards;
    }
    var key = '_' + action.player;

    // no valid cards available
    if (_.isEmpty(cards.pc[key]) || _.isEmpty(cards.pc[key + 'v'])) {
        console.error('EMPTY', action.player, cards.pc[key], cards.pc[key + 'v']);
        return cards;
    }

    var _cards = _.clone(cards);
    // taking random card from valid cards array
    var rc = _.sample(_cards.pc[key + 'v'], 1);
    // pulling that card from player cards array
    _cards.pc[key] = _.without(_cards.pc[key], rc[0]);
    // putting that card to trick
    _cards.trick[key] = rc[0];

    return _cards;
}

function prevalidate(cards, action) {
    var trick = cards.trick;
    var ret = { pc: {} };
    switch (action.current) {
        case 1:
            // getting first card played in the trick
            var fc = trick._2 || trick._3 || trick._4;
            // if undefined so there are no cards in trick and we can play any card, so adding all my cards to valid cards array
            if (fc) {
                var sc = findBySuite(cards.pc._1, fc);
                // if contains cards corresponding to given suite returning that list
                if (sc.length > 0) {
                    // can play any card
                    ret.pc._1v = sc;
                } else {
                    // check if my friend is grabbing the trick
                    if (trick._3 && winsTrick(trick, 3, fc, action.trumph)) {
                        // can play any card
                        ret.pc._1v = cards.pc._1;
                    } else {
                        // looking for trumphs
                        var tc = findBySuite(cards.pc._1, action.trumph);
                        if (tc.length > 0) {
                            //should play trumph
                            ret.pc._1v = tc;
                        } else {
                            // can play any card
                            ret.pc._1v = cards.pc._1;
                        }
                    }
                }
            } else {
                // can play any card
                ret.pc._1v = cards.pc._1;
            }
            break;
        case 2:
            // getting first card played in the trick
            var fc = trick._3 || trick._4 || trick._1;
            // if undefined so there are no cards in trick and we can play any card, so adding all my cards to valid cards array
            if (fc) {
                var sc = findBySuite(cards.pc._2, fc);
                // if contains cards corresponding to given suite returning that list
                if (sc.length > 0) {
                    // can play any card
                    ret.pc._2v = sc;
                } else {
                    // check if my friend is grabbing the trick
                    if (trick._4 && winsTrick(trick, 4, fc, action.trumph)) {
                        // can play any card
                        ret.pc._2v = cards.pc._2;
                    } else {
                        // looking for trumphs
                        var tc = findBySuite(cards.pc._2, action.trumph);
                        if (tc.length > 0) {
                            //should play trumph
                            ret.pc._2v = tc;
                        } else {
                            // can play any card
                            ret.pc._2v = cards.pc._2;
                        }
                    }
                }
            } else {
                // can play any card
                ret.pc._2v = cards.pc._2;
            }
            break;
        case 3:
            // getting first card played in the trick
            var fc = trick._4 || trick._1 || trick._2;
            // if undefined so there are no cards in trick and we can play any card, so adding all my cards to valid cards array
            if (fc) {
                var sc = findBySuite(cards.pc._3, fc);
                // if contains cards corresponding to given suite returning that list
                if (sc.length > 0) {
                    // can play any card
                    ret.pc._3v = sc;
                } else {
                    // check if my friend is grabbing the trick
                    if (trick._1 && winsTrick(trick, 1, fc, action.trumph)) {
                        // can play any card
                        ret.pc._3v = cards.pc._3;
                    } else {
                        // looking for trumphs
                        var tc = findBySuite(cards.pc._3, action.trumph);
                        if (tc.length > 0) {
                            //should play trumph
                            ret.pc._3v = tc;
                        } else {
                            // can play any card
                            ret.pc._3v = cards.pc._3;
                        }
                    }
                }
            } else {
                // can play any card
                ret.pc._3v = cards.pc._3;
            }break;
        case 4:
            // getting first card played in the trick
            var fc = trick._1 || trick._2 || trick._3;
            // if undefined so there are no cards in trick and we can play any card, so adding all my cards to valid cards array
            if (fc) {
                var sc = findBySuite(cards.pc._4, fc);
                // if contains cards corresponding to given suite returning that list
                if (sc.length > 0) {
                    // can play any card
                    ret.pc._4v = sc;
                } else {
                    // check if my friend is grabbing the trick
                    if (trick._2 && winsTrick(trick, 2, fc, action.trumph)) {
                        // can play any card
                        ret.pc._4v = cards.pc._4;
                    } else {
                        // looking for trumphs
                        var tc = findBySuite(cards.pc._4, action.trumph);
                        if (tc.length > 0) {
                            //should play trumph
                            ret.pc._4v = tc;
                        } else {
                            // can play any card
                            ret.pc._4v = cards.pc._4;
                        }
                    }
                }
            } else {
                // can play any card
                ret.pc._4v = cards.pc._4;
            }break;
    }
    //console.log(action.current,fc,sc,trick);
    ret.pc._1 = cards.pc._1;
    ret.pc._2 = cards.pc._2;
    ret.pc._3 = cards.pc._3;
    ret.pc._4 = cards.pc._4;

    return _.extendOwn(cards, ret);
}

function findBySuite(cards, card) {
    return _.filter(cards, function (c) {
        return c[0] == card[0];
    });
}

function winsTrick(cards, key, fc, trumph) {
    key = '_' + key;
    function getWeight(c) {
        var w = 0;
        if (c[0] == trumph[0]) w += 10;
        w += cardweights[c[1]];
        if (c[0] != trumph[0] && c[0] != fc[0]) w = 0;
        return w;
    }
    var weights = {};
    _.each(cards, function (c, p) {
        weights[p] = getWeight(c);
    });
    var max = _.max(weights);
    return weights[key] == max;
}

function getWinner(trick, fc, trumph) {
    if (winsTrick(trick, 1, fc, trumph)) return 1;
    if (winsTrick(trick, 2, fc, trumph)) return 2;
    if (winsTrick(trick, 3, fc, trumph)) return 3;
    if (winsTrick(trick, 4, fc, trumph)) return 4;
}

function shiftTurn(round) {
    //check for trick finish
    if (_.keys(round.cards.trick).length == 4) {
        // calculate winner and turn the trick
        // who was started the trick?
        switch (round.current) {
            case 1:
                var fc = round.cards.trick._2;
                break;
            case 2:
                var fc = round.cards.trick._3;
                break;
            case 3:
                var fc = round.cards.trick._4;
                break;
            case 4:
                var fc = round.cards.trick._1;
                break;
        }

        var winner = getWinner(round.cards.trick, fc, round.trumph);
        var next_turn = winner;
        var tricks = round.cards.tricks || { score: { 1: 0, 2: 0 }, history: [] };
        tricks.score[winner % 2 == 0 ? 2 : 1]++;
        tricks.history.push({ trick: round.cards.trick, winner: winner });

        //check for round finish
        var finished = tricks.history.length == 8;
        var _cards = _.extendOwn(round.cards, { tricks: tricks, trick: {} });
        return _.extendOwn(round, { current: next_turn, cards: _cards, finished: finished });
    } else {
        // shift the turn
        var next_turn = round.current == 4 ? 1 : round.current + 1;
        return _.extendOwn(round, { current: next_turn });
    }
}

module.exports = function (state, action) {
    if (undefined === state) return [];
    switch (action.type) {
        case 'ADD_ROUND':
            return state.concat({});
        // proxying actions to the last round
        case 'INIT_ROUND':
        case 'SET_TRUMPH':
        case 'DEAL':
        case 'PREVALIDATE':
        case 'PLAY_ANY':
        case 'SHIFT_TURN':
        case 'PLAY-SHIFT-PREVALIDATE':
            var n = _.clone(state);
            n[n.length - 1] = round(n[n.length - 1], action);
            return n;
        default:
            return state;
    }
};
//# sourceMappingURL=round.js.map