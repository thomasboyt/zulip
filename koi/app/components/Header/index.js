import React from 'react';
import { Link } from 'react-router';

import Breadcrumbs from './Breadcrumbs';
import SearchBox from './SearchBox';

const Header = React.createClass({
  render() {
    return (
      <div className="header">
        <div className="header-main rightside-userlist" id="top_navbar">

          <div className="column-left">
            <Link className="brand logo" to="/">
              <img src="/static/images/logo/zulipcornerlogo@2x.png"
                className="logoimage" alt="Zulip" content="Zulip" />
            </Link>
          </div>

          <div className="column-middle" id="navbar-middle">
            <div className="column-middle-inner">
              <div id="searchbox" className="searchbox-rightmargin">
                <Breadcrumbs />
                <SearchBox />
              </div>
            </div>
          </div>

          <div className="column-right" />
        </div>
      </div>
    );
  }
});

export default Header;
