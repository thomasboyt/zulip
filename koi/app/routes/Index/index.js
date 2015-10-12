import React from 'react';
import { connect } from 'react-redux';
import { getOldMessages } from '../../actions/zulip';

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

  renderMessages() {
    console.log(this.props.messages);
    return this.props.messages.map((message) => {
      return (
        <p key={message.id}>
          <strong>{message.sender_full_name}</strong>: {message.content}
        </p>
      );
    });
  },

  render() {
    return (
      <div>
        {this.renderMessages()}
      </div>
    );
  }
});

export default connect(select)(Index);
