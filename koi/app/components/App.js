import React from 'react';
import { HotKeys } from 'react-hotkeys';

import Header from './Header';
import LeftSidebar from './LeftSidebar';

const map = {
  'pointerUp': ['up', 'k']
};

const App = React.createClass({
  render() {
    return (
      <HotKeys keyMap={map} className="app">
        <Header/>

        <div className="fixed-app">
          <div className="app-main">
            <div className="column-middle column-overlay">
              <div id="tab_bar_underpadding" />
            </div>
          </div>
        </div>

        <div className="app-main">
          <div className="column-left">
            <LeftSidebar />
          </div>

          <div className="column-middle">
            <div className="column-middle-inner">
              {this.props.children}
            </div>
          </div>
          <div className="column-right" />
        </div>
      </HotKeys>
    );
  }
});

export default App;
