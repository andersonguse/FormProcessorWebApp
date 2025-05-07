import React from 'react';

const MessageScreen = ({ title, message, onBackClick, darkMode }) => {
  return (
    <div className={`message-screen ${darkMode ? 'dark-mode' : ''}`}>
      <div className="back-button-container">
        <button className="back-button" onClick={onBackClick}>
          ← Back
        </button>
      </div>
      <h1>{title}</h1>
      <p>{message}</p>
    </div>
  );
};

export default MessageScreen;
