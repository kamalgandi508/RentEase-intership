import React, { useState, useEffect } from 'react';
import { Toast as BootstrapToast, Container, Row, Col } from 'react-bootstrap';

const Toast = ({ show, onClose, message, type = 'info', autohide = true, delay = 3000, position = 'top-end' }) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  const getToastVariant = () => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
      case 'danger':
        return 'danger';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-start':
        return 'position-fixed top-0 start-0 p-3';
      case 'top-center':
        return 'position-fixed top-0 start-50 translate-middle-x p-3';
      case 'top-end':
        return 'position-fixed top-0 end-0 p-3';
      case 'bottom-start':
        return 'position-fixed bottom-0 start-0 p-3';
      case 'bottom-center':
        return 'position-fixed bottom-0 start-50 translate-middle-x p-3';
      case 'bottom-end':
        return 'position-fixed bottom-0 end-0 p-3';
      default:
        return 'position-fixed top-0 end-0 p-3';
    }
  };

  return (
    <div className={getPositionClasses()} style={{ zIndex: 1050 }}>
      <BootstrapToast
        show={isVisible}
        onClose={handleClose}
        bg={getToastVariant()}
        text={type === 'warning' ? 'dark' : 'white'}
        autohide={autohide}
        delay={delay}
      >
        <BootstrapToast.Header closeButton={true}>
          <strong className="me-auto">
            {type.charAt(0).toUpperCase() + type.slice(1)} Notification
          </strong>
          <small>{new Date().toLocaleTimeString()}</small>
        </BootstrapToast.Header>
        <BootstrapToast.Body>
          {message}
        </BootstrapToast.Body>
      </BootstrapToast>
    </div>
  );
};

export default Toast;
