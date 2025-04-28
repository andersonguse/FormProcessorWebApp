// MessageScreen.js
import React from 'react';

const MessageScreen = ({ message, isError, onBackClick, darkMode }) => {
  return (
    <div className={`message-screen ${darkMode ? 'dark-mode' : ''}`}>
      <button className="back-button" onClick={onBackClick}>
        ← Back
      </button>
      <div className="message-content">
        <p className={isError ? 'error-text' : 'success-text'}>
          {message}
        </p>
      </div>
    </div>
  );
};

export default MessageScreen;
