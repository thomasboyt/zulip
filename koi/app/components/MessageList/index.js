import React from 'react';

const MessageList = React.createClass({
  renderMessages() {
    return this.props.messages.map((message) => (
      <p key={message.id}>
        <strong>{message.sender_full_name}</strong>: {message.content}
      </p>
    ));
  },

  render() {
    return (
      <div className="message_area_padder message_list">
        <div className="message_table focused_table">
          {this.renderMessages()}
        </div>
      </div>
    );
  }
});

export default MessageList;
