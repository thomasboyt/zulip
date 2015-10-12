import React from 'react';

const App = React.createClass({
  render() {
    return (
      <div className="app">
        <div className="app-main">
          <div className="column-left" />
          <div className="column-middle">
            <div className="column-middle-inner">
              {this.props.children}
            </div>
          </div>
          <div className="column-right" />
        </div>
      </div>
    );
  }
});

export default App;
