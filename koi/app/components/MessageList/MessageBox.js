import React from 'react';

const MessageBox = React.createClass({
  renderAvatar(url) {
    const style = {
      backgroundImage: `url('${url}&stamp=59')`
    };

    return (
      <div className="inline_profile_picture" style={style} />
    );
  },

  renderTopLine() {
    if (!this.props.includeSender) {
      return null;
    }

    const {message} = this.props;

    return (
      <div className="message_top_line">
        <span className="message_sender sender_info_hover">
          {this.renderAvatar(message.avatar_url)}
          <span className="sender_name">
            {message.sender_full_name}
          </span>
        </span>
        <span className="message_time">
          3:33 AM
        </span>
        <div className="message_controls">
          <div className="star">
            <span className="message_star icon-vector-star-empty empty-star" title="Star this message"></span>
          </div>
        </div>
      </div>
    );
  },

  renderContent(content) {
    return (
      <div className="message_content" dangerouslySetInnerHTML={{__html: content}} />
    );
  },

  render() {
    const {message} = this.props;

    let className = 'message_row';

    if (this.props.includeSender) {
      className += ' include-sender';
    }

    if (message.type === 'private') {
      className += ' private-message';
    }

    return (
      <div className={className}>
        <div className="messagebox">
          <div className="messagebox-border">
            <div className="messagebox-content">
              {this.renderTopLine()}
              {this.renderContent(message.content)}
            </div>
          </div>
        </div>
      </div>
    );
  }
});

export default MessageBox;
