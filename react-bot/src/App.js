import React, { Component } from 'react';
import Pusher from 'pusher-js';
import './App.css';
import donutAvatar from './imgs/donut-avatar.png';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userMessage: '',
      conversation: [],
    };
  }

  componentDidMount() {
    const pusher = new Pusher("ffecf95b457fc394a90c", {
      cluster: "us2",
      encrypted: true,
    });

    const channel = pusher.subscribe('bot');
    channel.bind('bot-response', data => {
      const msg = {
        text: data.message,
        user: 'ai',
      };
      this.setState({
        conversation: [...this.state.conversation, msg],
      });
    });
  }

  handleChange = event => {
    this.setState({ userMessage: event.target.value });
  };

  handleSubmit = event => {
    event.preventDefault();
    if (!this.state.userMessage.trim()) return;

    const msg = {
      text: this.state.userMessage,
      user: 'human',
    };

    this.setState({
      conversation: [...this.state.conversation, msg],
    });

    fetch('http://localhost:5000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: this.state.userMessage,
      }),
    });

    this.setState({ userMessage: '' });
  };

  render() {
    const ChatBubble = (text, i, className) => {
      if (className === "human") {
        return (
          <div key={`${className}-${i}`} className="message-wrap">
            <div className="human_img"> <img src="https://ptetutorials.com/images/user-profile.png" alt="human" /> </div>
            <div key={`${className}-${i}`} className={`${className} chat-bubble`}>
              <span className="chat-content">{text}</span>
            </div>
          </div>
        );
      }
      if (className === "ai") {
        return (
          <div key={`${className}-${i}`} className="message-wrap">
            <div key={`${className}-${i}`} className={`${className} chat-bubble`}>
              <span className="chat-content">{text}</span>
            </div>
            <div className="donut_img"> <img src={donutAvatar} alt="ai" /> </div>
          </div>
        );
      }
    };

    const chat = this.state.conversation.map((e, index) =>
      ChatBubble(e.text, index, e.user)
    );

    return (
      <div className="outer-wrap">
      <h1>Bakery Chatbot</h1>
        <div className="chat-window">
          <div className="conversation-view">{chat}</div>
          <div className="message-box">
            <form onSubmit={this.handleSubmit}>
              <input
                value={this.state.userMessage}
                onInput={this.handleChange}
                className="text-input"
                type="text"
                autoFocus
                placeholder="Type your message and hit Enter to send"
              />
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
