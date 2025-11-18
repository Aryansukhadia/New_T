import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  IconButton,
  InputAdornment,
  CircularProgress,
  Container,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useToast } from '../Utils/ToastContext';
import { loginService, setAuthToken, setUserInfo } from '../Services/ApiServices';
import axios from 'axios';
import MUICustomBtn from '../Components/Common/MUICustomBtn';

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
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 450,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            borderRadius: 2,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              align="center"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              Welcome Back
            </Typography>
            <Typography
              variant="body1"
              align="center"
              color="text.secondary"
              sx={{ mb: 4 }}
            >
              Sign in to your account
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                type="email"
                id="emailId"
                name="emailId"
                label="Email Address"
                value={formData.emailId}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                disabled={loading}
                margin="normal"
                variant="outlined"
              />

              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                label="Password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                disabled={loading}
                margin="normal"
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                        edge="end"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <MUICustomBtn
                fullWidth
                variant="contained"
                disabled={loading}
                type="submit"
                tooltip="Sign In"
                tooltipPlacement="bottom"
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </MUICustomBtn>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Login;

