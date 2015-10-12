import React from 'react';

import { IndexRoute, Route, Router } from 'react-router';

import createBrowserHistory from 'history/lib/createBrowserHistory';
import { useBasename } from 'history';
let history = useBasename(createBrowserHistory)({
  basename: '/koi'
});

export default (
  <Router history={history}>
    <Route path="/login" component={require('../routes/Login')} />

    <Route path="/" component={require('../components/App')}>
      <IndexRoute component={require('../routes/Index')} />
    </Route>
  </Router>
);
