import styled from 'styled-components';

export const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

export const FormCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 450px;
`;

export const FormTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
  text-align: center;
`;

export const FormSubtitle = styled.p`
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-bottom: 32px;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
`;

export const Label = styled.label`
  font-size: 15px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  
  svg {
    color: #667eea;
    font-size: 16px;
  }
`;

export const Input = styled.input`
  padding: 14px 18px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: #fafafa;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05);
    transform: translateY(-1px);
  }
  
  &:hover:not(:disabled):not(:focus) {
    border-color: #ccc;
    background: white;
  }
  
  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
    opacity: 0.7;
  }
  
  &::placeholder {
    color: #999;
  }
`;

export const Select = styled.select`
  padding: 14px 18px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  background-color: #fafafa;
  transition: all 0.3s ease;
  cursor: pointer;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05);
    transform: translateY(-1px);
  }
  
  &:hover:not(:disabled) {
    border-color: #ccc;
    background: white;
  }
  
  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

export const Button = styled.button`
  padding: 14px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export const ErrorMessage = styled.div`
  background-color: #fee;
  color: #c33;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  border: 1px solid #fcc;
`;

export const SuccessMessage = styled.div`
  background-color: #efe;
  color: #3c3;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  border: 1px solid #cfc;
`;

export const LinkText = styled.p`
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #666;
  
  a {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

export const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

