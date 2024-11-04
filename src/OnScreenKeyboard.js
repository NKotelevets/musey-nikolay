import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';

const OnScreenKeyboard = ({ onSend }) => {
  const [message, setMessage] = useState('');

  const handleKeyPress = (button) => {
    if (button === "{bksp}") {
      setMessage((prevMessage) => prevMessage.slice(0, -1));
    } else if (button === "{space}") {
      setMessage((prevMessage) => prevMessage + ' ');
    } else {
      setMessage((prevMessage) => prevMessage + button);
    }
  };

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <div className="on-screen-keyboard">
      <div className="display">{message}</div>
      <Keyboard
        onKeyPress={handleKeyPress}
        layout={{
          default: [
            "Q W E R T Y U I O P",
            "A S D F G H J K L",
            "Z X C V B N M {bksp}",
            "{space} {send}"
          ],
        }}
        display={{
          "{bksp}": "⌫",
          "{space}": "␣",
          "{send}": "Send"
        }}
        buttonTheme={[
          { class: "hg-send", buttons: "{send}" },
        ]}
        onChange={() => {}}
        onKeyReleased={(button) => button === "{send}" && handleSend()}
      />
    </div>
  );
};

OnScreenKeyboard.propTypes = {
  onSend: PropTypes.func.isRequired,
};

export default OnScreenKeyboard;