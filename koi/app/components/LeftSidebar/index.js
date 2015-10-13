import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { unparse } from '../../utils/Filter';

function select(state) {
  return {
    subscriptions: state.streams.subscriptions
  };
}

const LeftSidebar = React.createClass({
  renderStreamFilters() {
    const streams = this.props.subscriptions.map((stream) => {
      // TODO: use some kind of narrow serializer for this
      const narrow = encodeURIComponent(unparse([{
        operator: 'stream',
        operand: stream.name
      }]));

      return (
        <li className="narrow-filter" key={stream.stream_id}>
          <div className="subscription_block selectable_sidebar_block" >
            <div className="streamlist_swatch">&nbsp;</div>

            <Link to={`/?narrow=${narrow}`} className="subscription_name">
              {stream.name}
            </Link>

            <div className="count">
              <div className="value" />
            </div>
          </div>
        </li>
      );
    });

    return (
      <ul id="stream_filters" className="filters">
        {streams}
      </ul>
    );
  },

  render() {
    const privateNarrow = encodeURIComponent(unparse([{
      operator: 'is',
      operand: 'private'
    }]));

    const starredNarrow = encodeURIComponent(unparse([{
      operator: 'is',
      operand: 'starred'
    }]));

    const mentionedNarrow = encodeURIComponent(unparse([{
      operator: 'is',
      operand: 'mentioned'
    }]));

    return (
      <div className="left-sidebar" id="left-sidebar">
        <div className="bottom_sidebar">
          <ul id="global_filters" className="filters">
            <li data-name="home" className="global-filter active-filter">
              <span className="filter-icon">
                <i className="icon-vector-home" />
              </span>
              <Link to="/">
                Home
              </Link>
            </li>
            <li data-name="private" className="global-filter">
              <span className="filter-icon">
                <i className="icon-vector-user"></i>
              </span>
              <Link to={`/?narrow=${privateNarrow}`}>
                Private messages
              </Link>
            </li>
            <li data-name="starred" className="global-filter">
              <span className="filter-icon">
                <i className="icon-vector-star"></i>
              </span>
              <Link to={`/?narrow=${starredNarrow}`}>
                Starred messages
              </Link>
            </li>
            <li data-name="mentioned" className="global-filter">
              <span className="filter-icon">
                <i className="icon-vector-tag"></i>
              </span>
              <Link to={`/?narrow=${mentionedNarrow}`}>
                @-mentions
              </Link>
            </li>
          </ul>

          <div id="streams_list">
            <div id="streams_header">
              <h4 className="sidebar-title">STREAMS</h4>
            </div>
            <div id="stream-filters-container" className="scrolling_list ps-container">
              {this.renderStreamFilters()}
            </div>
          </div>
        </div>
      </div>
    );
  }
});

export default connect(select)(LeftSidebar);
