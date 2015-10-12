import createReducer from '../utils/createReducer';

const initialState = {
  messages: []
};

const actionHandlers = {
  'getOldMessages:success': function(state, {messages}) {
    state.messages = messages;
    return state;
  }
};

export default createReducer(initialState, actionHandlers);
