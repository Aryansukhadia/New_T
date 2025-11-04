import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import styled from 'styled-components';
import {
  FormContainer,
  FormCard,
  FormTitle,
  FormSubtitle,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  LoadingSpinner,
  LinkText,
} from '../Components/Common/FormComponents';
import { useToast } from '../Utils/ToastContext';
import { loginService, setAuthToken, setUserInfo } from '../Services/ApiServices';
import axios from 'axios';

const PasswordInputWrapper = styled.div`
  position: relative;
  width: 100%;
  box-sizing: border-box;
`;

const PasswordToggleButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: color 0.2s ease;
  z-index: 1;
  
  &:hover {
    color: #667eea;
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  
  svg {
    font-size: 18px;
  }
`;

const PasswordInput = styled(Input)`
  padding-right: 45px;
  box-sizing: border-box;
  width: 100%;
`;

const Login = () => {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const [formData, setFormData] = useState({
    emailId: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await loginService(formData);

      if (response.success === 200 && response.data) {
        // Store token and user info
        setAuthToken(response.data.token);
        setUserInfo(response.data);

        showSuccess('Login successful! Redirecting...', 'Success');

        // Redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } else {
        showError(response.message || 'Login failed', 'Login Failed');
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errorMsg = err.response?.data?.message || 'Login failed. Please try again.';
        showError(errorMsg, 'Login Failed');
      } else {
        showError('An unexpected error occurred. Please try again.', 'Error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer>
      <FormCard>
        <FormTitle>Welcome Back</FormTitle>
        <FormSubtitle>Sign in to your account</FormSubtitle>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="emailId">Email Address</Label>
            <Input
              type="email"
              id="emailId"
              name="emailId"
              value={formData.emailId}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <PasswordInputWrapper>
              <PasswordInput
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
              <PasswordToggleButton
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </PasswordToggleButton>
            </PasswordInputWrapper>
          </FormGroup>

          <Button type="submit" disabled={loading}>
            {loading ? <LoadingSpinner /> : 'Sign In'}
          </Button>
        </Form>

        <LinkText>
          Don't have an account? <Link to="/register">Sign up here</Link>
        </LinkText>
      </FormCard>
    </FormContainer>
  );
};

export default Login;

