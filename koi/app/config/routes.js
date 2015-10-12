import React from 'react';

import { IndexRoute, Route, Router } from 'react-router';

import createBrowserHistory from 'history/lib/createBrowserHistory';
import { useBasename } from 'history';
let history = useBasename(createBrowserHistory)({
  basename: '/koi'
});

export default (
  <Router history={history}>
    <Route path="/" component={require('../components/App')}>
      <Route path="login" component={require('../routes/Login')} />

      <IndexRoute component={require('../routes/Index')} />
    </Route>
  </Router>
);
