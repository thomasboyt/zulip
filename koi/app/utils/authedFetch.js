import 'whatwg-fetch';

const csrfToken = document.querySelector('input[name=csrfmiddlewaretoken]').value;

export default async function authedFetch(url, opts) {
  const finalOpts = {
    credentials: 'same-origin',
    headers: {
      'X-CSRFToken': csrfToken
    },
    ...opts
  };

  const resp = await window.fetch(url, finalOpts);

  if (resp.status === 403) {
    document.location = '/accounts/login';
  }

  return resp;
}
