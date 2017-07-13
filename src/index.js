"use strict";

import { createStore,combineReducers,applyMiddleware } from 'redux';
import storage from './services/storage';
import {v4} from 'node-uuid';
import defaults from './defaults';

const createCore = async (options = {}) => {
    const {room,path} = Object.assign({}, defaults, options);
    storage.room = room;
    storage.path = path;
    const reducers = {
        players: require('./reducers/player'),
        rounds: require('./reducers/round'),
        meta: require('./reducers/meta')
    }
    const store = createStore(combineReducers(reducers), await storage.loadState());
    store.subscribe(()=>{
        storage.saveState(store.getState());
    })
    return store; 
}

const defaultCore = () => {
    return createCore()({room:v4()});
};

export { defaults, storage, defaultCore as omiCore, createCore };
export default defaultCore;
