import React from 'react';

const ActionButton = ({ onClick, title, className, children }) => {
  return (
    <button onClick={onClick} className={`action-button ${className}`} title={title}>
      {children}
    </button>
  );
};

export default ActionButton;