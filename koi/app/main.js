require('../styles/main.css');
import 'babel/polyfill';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import routes from './config/routes';
import store from './config/store';

render((
  <Provider store={store}>
    {routes}
  </Provider>
), document.getElementById('koi-container'));
