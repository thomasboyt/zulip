import createReducer from '../utils/createReducer';

const initialState = {
  authed: false
};

const actionHandlers = {};

export default createReducer(initialState, actionHandlers);
