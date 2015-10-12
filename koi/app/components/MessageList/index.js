import React from 'react';
import MessageBox from './MessageBox';

function contiguous(prev, next) {
  if (!prev) {
    return false;
  }

  if (prev.type !== next.type) {
    return false;
  }

  if (prev.type === 'stream') {
    return prev.display_recipient === next.display_recipient && prev.subject === next.subject;

  } else if (prev.type === 'private') {
    return prev.recipient_id === next.recipient_id;

  } else {
    return false;
  }
}

const MessageList = React.createClass({
  renderMessages() {
    const groupedMessages = [];

    let last = null;
    for (let message of this.props.messages) {
      if (contiguous(last, message)) {
        groupedMessages[groupedMessages.length - 1].push(message);
      } else {
        groupedMessages.push([message]);
      }

      last = message;
    }

    return groupedMessages.map((messages) => {
      let last = null;

      const messageRows = messages.map((message) => {
        const includeSender = !last || message.sender_id !== last.sender_id;
        last = message;

        return (
          <MessageBox includeSender={includeSender} message={message} key={message.id} />
        );
      });

      return (
        <div className="recipient_row" key={messages[0].id}>
          {this.renderMessageHeader(messages[0])}
          {messageRows}
        </div>
      );
    });
  },

  renderParticipants(message) {
    const participants = message.display_recipient.filter((participant) => {
      // TODO: filter out current user
      return true
    });

    const names = participants.map((participant) => participant.full_name);

    return names.join(', ');
  },

  renderMessageHeader(message) {
    if (message.type === 'stream') {
      const stream = message.display_recipient;
      const subject = message.subject;

      return (
        <div className="message_header message_header_stream right_part">
          <div className="message-header-wrapper">
            <div className="message-header-contents">
              <a className="message_label_clickable narrows_by_recipient stream_label" title={`Narrow to stream "${stream}"`}>
                {stream}
              </a>
              <span className="copy-paste-text" />
              <span className="stream_topic">
                <a className="message_label_clickable narrows_by_subject"
                  title={`Narrow to stream "${stream}", topic "${subject}"`}>
                  {subject}
                </a>
              </span>
            </div>
          </div>
        </div>
      );

    } else if (message.type === 'private') {
      const participants = this.renderParticipants(message);

      return (
        <div className="message_header message_header_private_message dark_background">
          <div className="message-header-wrapper">
            <div className="message-header-contents">
              <a className="message_label_clickable narrows_by_recipient" title={`Narrow to you and ${participants}`}>
                You and {participants}
              </a>
            </div>
          </div>
        </div>
      );
    }
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
