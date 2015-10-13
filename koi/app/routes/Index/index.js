import React from 'react';
import { connect } from 'react-redux';
import { narrow } from '../../actions/zulip';

import Filter, { parse } from '../../utils/Filter';

import MessageList from '../../components/MessageList';

function select(state) {
  return {
    messages: state.zulip.messages,
    pointerId: state.zulip.pointerId,
    narrowQuery: state.zulip.narrowQuery,
  };
}

const Index = React.createClass({
  componentDidMount() {
    const narrowQuery = this.props.location.query.narrow && decodeURIComponent(this.props.location.query.narrow);

    this.props.dispatch(narrow(narrowQuery, {
      anchor: this.props.pointerId,
      num_before: 200,
      num_after: 200,
    }));
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.location.query.narrow !== this.props.location.query.narrow) {
      const narrowQuery = nextProps.location.query.narrow && decodeURIComponent(nextProps.location.query.narrow);

      this.props.dispatch(narrow(narrowQuery, {
        anchor: this.props.pointerId,
        num_before: 50,
        num_after: 50,
      }));
    }
  },

  render() {
    const narrowQuery = this.props.narrowQuery;

    let messages = this.props.messages;
    if (narrowQuery) {
      const predicate = new Filter(parse(narrowQuery)).predicate();
      messages = this.props.messages.filter(predicate);
    }

    return (
      <MessageList
        messages={messages}
        pointerId={this.props.pointerId} />
    );
  }
});

export default connect(select)(Index);
