/**
 * Created by GAZ on 7/13/17.
 */
const bluebird = require('bluebird');
const redis = require('redis');
const fs = require('fs');
bluebird.promisifyAll(redis.RedisClient.prototype);
const db = redis.createClient({prefix:'ns-core-'});

var storage = {
    room:undefined,
    path:undefined,
    loadState: async () => {
        try{
            const serializedState = await db.getAsync(storage.room);
            if(null === serializedState)
                return undefined;
            return JSON.parse(serializedState);
        } catch(err) {
            return undefined;
        }
    },

    saveState: (state) => {
        try{
            db.set(storage.room,JSON.stringify(state));
        } catch(err) { console.error(err) }
    },

    saveGame: (state) => {
        try{
            return fs.writeFileSync(storage.path + storage.room + '.json', JSON.stringify(state), 'utf8');
        } catch (err){
            console.error(err)
            return err;
        }
    }
}

export default storage;
