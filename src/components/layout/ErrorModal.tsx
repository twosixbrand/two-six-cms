import React from 'react';
import './ErrorModal.css';

const ErrorModal = ({ error, componentStack, onClose }) => {
  if (!error) return null;

  return (
    <div className="error-modal-overlay">
      <div className="error-modal-content">
        <div className="error-modal-header">
          <h2>Ha ocurrido un error</h2>
          <button onClick={onClose} className="error-modal-close">&times;</button>
        </div>
        <div className="error-modal-body">
          <h4>Mensaje:</h4>
          <p>{error.message}</p>
          <h4>Stack Trace:</h4>
          <pre>{error.stack}</pre>
          <h4>Component Stack:</h4>
          <pre>{componentStack}</pre>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;