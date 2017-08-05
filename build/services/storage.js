'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * Created by GAZ on 7/13/17.
 */
var bluebird = require('bluebird');
var redis = require('redis');
var fs = require('fs');
bluebird.promisifyAll(redis.RedisClient.prototype);
var db = redis.createClient({ prefix: 'ns-core-' });

var storage = {
    room: undefined,
    path: undefined,
    loadState: async function loadState() {
        try {
            var serializedState = await db.getAsync(storage.room);
            if (null === serializedState) return undefined;
            return JSON.parse(serializedState);
        } catch (err) {
            return undefined;
        }
    },

    saveState: function saveState(state) {
        try {
            db.set(storage.room, JSON.stringify(state));
        } catch (err) {
            console.error(err);
        }
    },

    saveGame: function saveGame(state) {
        try {
            return fs.writeFileSync(storage.path + storage.room + '.json', JSON.stringify(state), 'utf8');
        } catch (err) {
            console.error(err);
            return err;
        }
    }
};

exports.default = storage;
//# sourceMappingURL=storage.js.map