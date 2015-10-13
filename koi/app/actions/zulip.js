import authedFetch from '../utils/authedFetch';
import makeForm from '../utils/makeForm';

import { parse as parseFilter } from '../utils/Filter';

export function narrow(narrowQuery, opts) {
  return async function(dispatch) {
    dispatch({
      type: 'narrow',
      narrowQuery
    });

    const queryOpts = Object.assign({}, opts);

    if (narrowQuery) {
      queryOpts['narrow'] = JSON.stringify(parseFilter(narrowQuery));
    }

    const res = await authedFetch('/json/get_old_messages', {
      method: 'POST',
      body: makeForm(queryOpts)
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
