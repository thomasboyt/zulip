import authedFetch from '../utils/authedFetch';
import makeForm from '../utils/makeForm';

export function getOldMessages(opts) {
  return async function(dispatch) {
    const res = await authedFetch('/json/get_old_messages', {
      method: 'POST',
      body: makeForm(opts)
    });

    const json = await res.json();
    const messages = json.messages;

    dispatch({
      type: 'getOldMessages:success',
      messages
    });
  };
}

// export function getEvents() {
//   return async function(dispatch) {
//     const res = await authedFetch('/json/get_events', {
//       method: 'POST',
//       body: makeForm({
//         dont_block: false,
//         queue_id:
//       })
//     });
//
//   }
// }
