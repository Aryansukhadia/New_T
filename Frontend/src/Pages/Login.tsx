import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  ErrorMessage,
  LoadingSpinner,
  LinkText,
} from '../Components/Common/FormComponents';
import { loginService, setAuthToken, setUserInfo } from '../ApiDetails/AuthApi';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    emailId: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginService(formData);
      
      if (response.success === 200 && response.data) {
        // Store token and user info
        setAuthToken(response.data.token);
        setUserInfo(response.data);
        
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || 'Login failed. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
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
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
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
            <Input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
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

