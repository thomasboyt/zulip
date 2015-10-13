import _ from 'lodash';
import createReducer from '../utils/createReducer';

const initialState = {
  subscriptions: window.pageParams.subscribed_streams,
};

const actionHandlers = {
};

export default createReducer(initialState, actionHandlers);

export function inHomeView(state, streamName) {
  return _.some(state.subscriptions, {name: streamName});
}
