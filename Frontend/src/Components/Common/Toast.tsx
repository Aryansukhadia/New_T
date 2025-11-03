import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const slideIn = keyframes`
  from {
    transform: translateX(100%) translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateX(0) translateY(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0) translateY(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%) translateY(20px);
    opacity: 0;
  }
`;

export const ToastContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
`;

const ToastWrapper = styled.div<{ type: 'success' | 'error' | 'info' | 'warning'; isVisible: boolean }>`
  min-width: 320px;
  max-width: 450px;
  padding: 16px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 12px;
  pointer-events: auto;
  border-left: 4px solid ${(props) => {
    switch (props.type) {
      case 'success':
        return '#4caf50';
      case 'error':
        return '#d32f2f';
      case 'warning':
        return '#ff9800';
      case 'info':
        return '#1976d2';
      default:
        return '#667eea';
    }
  }};
  animation: ${(props) => (props.isVisible ? slideIn : slideOut)} 0.3s ease;
`;

const ToastIcon = styled.div<{ type: 'success' | 'error' | 'info' | 'warning' }>`
  font-size: 24px;
  flex-shrink: 0;
  color: ${(props) => {
    switch (props.type) {
      case 'success':
        return '#4caf50';
      case 'error':
        return '#d32f2f';
      case 'warning':
        return '#ff9800';
      case 'info':
        return '#1976d2';
      default:
        return '#667eea';
    }
  }};
`;

const ToastContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ToastTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #333;
`;

const ToastMessage = styled.div`
  font-size: 14px;
  color: #666;
  line-height: 1.4;
`;

const ToastCloseButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  flex-shrink: 0;
  transition: all 0.2s ease;

  &:hover {
    background: #f5f5f5;
    color: #666;
  }
`;

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const ToastComponent = ({ toast, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const duration = toast.duration || 4000;
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(toast.id), 300); // Wait for animation to finish
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(toast.id), 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <FaCheckCircle />;
      case 'error':
        return <FaExclamationCircle />;
      case 'warning':
        return <FaExclamationCircle />;
      case 'info':
        return <FaInfoCircle />;
      default:
        return <FaInfoCircle />;
    }
  };

  return (
    <ToastWrapper type={toast.type} isVisible={isVisible}>
      <ToastIcon type={toast.type}>{getIcon()}</ToastIcon>
      <ToastContent>
        {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
        <ToastMessage>{toast.message}</ToastMessage>
      </ToastContent>
      <ToastCloseButton onClick={handleClose} title="Close">
        <FaTimes />
      </ToastCloseButton>
    </ToastWrapper>
  );
};

export default ToastComponent;

