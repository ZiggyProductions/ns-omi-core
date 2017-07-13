/**
 * Created by GAZ on 7/9/17.
 */
const subject = require('./src/index');
import {v4} from 'node-uuid';
const _ = require('underscore');
var room = v4();
var store;
it('begin', done => {
    subject.createCore({room:room}).then((s)=> {
        store = s;
        expect(typeof s).toBe('object');
        done();
    });
});



//console.log(store.getState())
test('should add a 4 new players to store', () => {
    for(var i=1;i<=4;++i) {
        store.dispatch({
            type: 'ADD_PLAYER',
            player: {id: i}
        });
    }
    expect(store.getState().players.length).toBe(4);
});

test('should try to add same player to store (no change should occur)', () => {
    store.dispatch({
        type: 'ADD_PLAYER',
        player: {id: 5}
    });
    expect(store.getState().players.length).toBe(4);
});

test('should add a new round to store', () => {
    store.dispatch({
        type: 'ADD_ROUND'
    })
    expect(store.getState().rounds.length).toBe(1);
});
// test('should change meta', () => {
//     store.dispatch({
//         type: 'SET_META_ROUND',
//         round: store.getState().rounds.length
//     });
//     expect(store.getState().meta.round).toBe(1);
// });

// SINGLE ROUND

test('should initialize the round', function () {
    store.dispatch({
        type: 'INIT_ROUND',
        first: 1/*,
        test: {
            _1: ['sA', 'd7', 'cQ', 'd10', 'dK', 'sK', 'cK', 'c8'],
            _2: ['dA', 'cA', 'dQ', 'sJ', 'h8', 'sQ', 'd9', 'cJ'],
            _3: ['s9', 's7', 'c10', 'hK', 'c9', 'h7', 'c7', 's8'],
            _4: ['h9', 'd8', 's10', 'hA', 'hJ', 'h10', 'dJ', 'hQ']
        }*/
    })
    expect(_.last(store.getState().rounds).first).toBe(1);
});
test('should deal 4 cards each', function () {
    store.dispatch({
        type: 'DEAL',
        count:4
    })
    expect(_.last(store.getState().rounds).cards.deck.length).toBe(16);
});
test('should set trumph for current round', function () {
    store.dispatch({
        type: 'SET_TRUMPH',
        trumph:'♥'
    })
    expect(_.last(store.getState().rounds).trumph).toBe('♥');
});
test('should deal another 4 cards each', function () {
    store.dispatch({
        type: 'DEAL',
        count:4
    })
    expect(_.last(store.getState().rounds).cards.deck.length).toBe(0);
    //console.log(_.last(store.getState().rounds).cards.pc);

});
test('Prevalidate player cards', function () {
    store.dispatch({
        type: 'PREVALIDATE'
    })
    expect(_.last(store.getState().rounds).cards.pc._1v).not.toBe(undefined);
});
test('Try to play a random valid card breaking the order', function () {
    store.dispatch({
        type: 'PLAY_ANY',
        player: 2
    })
    expect(_.isEmpty(_.last(store.getState().rounds).cards.trick)).toBe(true);
});

/*
test('Try to play full trick', () => {
    console.log('ROUND:',1);
    for(var i=1;i<=4;++i){
        const key = '_'+i , vkey = key + 'v';
            store.dispatch({
                type: 'PREVALIDATE'
            })
            //console.log(_.last(store.getState().rounds).cards.pc[vkey]);

            store.dispatch({
                type: 'PLAY_ANY',
                player: i
            })
            store.dispatch({
                type: 'SHIFT_TURN'
            })
    }
    //console.log(_.last(store.getState().rounds).cards.tricks.score);
    //console.log(_.last(store.getState().rounds).cards.tricks.history);

    expect(_.isEmpty(_.last(store.getState().rounds).cards.trick)).toBe(true);
});
*/

function pps(id){
    "use strict";
    store.dispatch({
        type: 'PLAY-SHIFT-PREVALIDATE',
        player: id
    })
}
function finalizeRoundAndStartNewOne(){
    "use strict";
    if(_.last(store.getState().rounds).finished == true) {
        var first = _.last(store.getState().rounds).first + 1;
        first = first > 4 ? 1 : first;
        store.dispatch({
            type: 'UPDATE_SCORE',
            rounds: store.getState().rounds
        });

        const score = store.getState().meta.score;
        if(score[1] >= 10 || score[2] >= 10) { // Finita
            return 0;
        }else{
            store.dispatch({
                type: 'ADD_ROUND'
            })
            store.dispatch({
                type: 'INIT_ROUND',
                first: first
            })
            return first;

        }


    }
}
function playRound(){
    var order = {
        1:[1,2,3,4],
        2:[2,3,4,1],
        3:[3,4,1,2],
        4:[4,1,2,3],
    }
    for(var r=1;r<=8;++r) {
        //console.log('ROUND:',r);
        //console.log(_.last(store.getState().rounds).cards);

        var c = _.last(store.getState().rounds).current;
        _.each(order[c], (i)=>{
            const key = '_' + i, vkey = key + 'v';
            pps(i);
        });
    }
}
function dealAndTrumph() {
    store.dispatch({
        type: 'DEAL',
        count:4
    })
    store.dispatch({
        type: 'SET_TRUMPH',
        trumph:_.sample(['♣', '♦', '♠', '♥'])
    })
    store.dispatch({
        type: 'DEAL',
        count:4
    })
    store.dispatch({
        type: 'PREVALIDATE'
    })
}

test('Try to play full round', () => {
    playRound();
    console.log(_.last(store.getState().rounds).cards.tricks.score);
    expect(_.last(store.getState().rounds).finished).toBe(true);
});

test('Try to play the rest of rounds', () => {
    "use strict";

    do{
        var first = finalizeRoundAndStartNewOne();
        if(first > 0) {
            dealAndTrumph();
            playRound();
            console.log(_.last(store.getState().rounds).cards.tricks.score);

            //expect(_.last(store.getState().rounds).first).toBe(first);
        }
        else
            expect(true).toBe(true);
    }
    while(first > 0)



    console.log(store.getState().rounds);
    console.log(store.getState().meta.score);
});

it('Try to save the game', () => {
    const ret = subject.storage.saveGame(store.getState());
    expect(typeof ret).not.toBe('object');
});


