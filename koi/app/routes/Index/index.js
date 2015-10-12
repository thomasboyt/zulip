import React from 'react';
import { connect } from 'react-redux';
import { getOldMessages } from '../../actions/zulip';

import MessageList from '../../components/MessageList';

function select(state) {
  return {
    messages: state.zulip.messages
  };
}

const Index = React.createClass({
  componentDidMount() {
    this.props.dispatch(getOldMessages({
      // TODO: where's anchor come from initially?
      anchor: 100,
      num_before: 200,
      num_after: 200
    }));
  },

  render() {
    return (
      <MessageList messages={this.props.messages} />
    );
  }
});

export default connect(select)(Index);
