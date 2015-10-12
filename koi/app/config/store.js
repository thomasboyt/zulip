import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import * as reducers from '../reducers';

const store = applyMiddleware(thunk)(createStore)(combineReducers(reducers));

export default store;
