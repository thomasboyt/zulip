import _ from 'lodash';
import createReducer from '../utils/createReducer';

const initialState = {
  // sorted array of all messages
  messages: [],

  // memoizable representation of the current filter
  narrowQuery: null,

  // message ID of the pointer
  pointerId: window.pageParams.initial_pointer,

  // index of the pointer in the list of filtered messages
  pointerIndex: null,
};

// hash of id -> message
// used to determine if we've already loaded an incoming message
const idHash = {};

function insertMessages(existing, newMessages) {
  const messages = existing.slice();

  newMessages.forEach((message) => {
    if (idHash[message.id]) {
      return;
    }

    idHash[message.id] = true;

    if (message.type === 'stream') {
      // XXX: Filter relies on this, not sure if we should keep using it...
      message.stream = message.display_recipient;
    }

    messages.push(message);
  });

  // TODO: we can optimize this so we don't sort unless we have to
  messages.sort((a, b) => a.id - b.id);

  return messages;
}

const actionHandlers = {
  'narrow': function(state, {narrowQuery}) {
    state.narrowQuery = narrowQuery;
    return state;
  },

  'getOldMessages:success': function(state, {messages}) {
    // TODO: push in sorted form
    state.messages = insertMessages(state.messages, messages);

    state.pointerIndex = _.findIndex(state.messages, {id: state.pointerId});

    return state;
  },

  'pointerUp': function(state) {
    if (state.pointerIndex === null) {
      return state;
    }

    // TODO: this should use filter
    const messages = state.messages;
    const newIndex = state.pointerIndex - 1;

    if (!messages[newIndex]) {
      // TODO: this probably means we need to load prev set of messages... annoying since
      // we can't dispatch an action from here, I think?
      // may need to move this handler into <MessageList /> or similar
      return state;
    }

    state.pointerId = messages[newIndex].id;
    state.pointerIndex = newIndex;

    return state;
  },
};

export default createReducer(initialState, actionHandlers);
