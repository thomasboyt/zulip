import React from 'react';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';

const SearchBox = React.createClass({
  handleSubmit(e) {
    e.preventDefault();
    const search = findDOMNode(this.refs.searchInput).value;
    // TODO: actually do a search
  },

  render() {
    return (
      <form id="searchbox_form" className="form-search navbar-search" onSubmit={this.handleSubmit}>
        <div id="search_arrows" className="input-append">
          <i className="icon-vector-search" />
          <input className="search-query input-block-level" ref="searchInput"
            id="search_query" type="text" placeholder="Search" autoComplete="off" />

          <button className="btn search_button" type="button" id="search_exit">
            <i className="icon-vector-remove" />
          </button>
        </div>
      </form>
    );
  }
});

export default connect()(SearchBox);
