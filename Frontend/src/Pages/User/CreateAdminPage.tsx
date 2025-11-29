import { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { createAdminBySuperAdminService } from '../../Services/ApiServices/authServices';
import { useToast } from '../../Utils/ToastContext';
import { useNavigate } from 'react-router-dom';

const CreateAdminPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    emailId: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    fullName: '',
    emailId: '',
    password: '',
  });

  const validateForm = () => {
    const newErrors = {
      fullName: '',
      emailId: '',
      password: '',
      role: '',
    };

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.emailId.trim()) {
      newErrors.emailId = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailId)) {
      newErrors.emailId = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await createAdminBySuperAdminService({
        fullName: formData.fullName.trim(),
        emailId: formData.emailId.trim().toLowerCase(),
        password: formData.password,
        role: 'admin',
      });

      if (response.success === 201) {
        showSuccess('Admin created successfully!', 'Success');
        // Reset form
        setFormData({
          fullName: '',
          emailId: '',
          password: '',
        });
      } else {
        showError(response.message || 'Failed to create admin', 'Error');
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        showError(axiosError.response?.data?.message || 'An error occurred', 'Error');
      } else {
        showError('An unexpected error occurred', 'Error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ borderRadius: 1.5, p: 3, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Create Admin User
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create a new admin user. Only SuperAdmin can access this page.
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            fullWidth
            label="Full Name"
            value={formData.fullName}
            onChange={(e) => {
              setFormData({ ...formData, fullName: e.target.value });
              setErrors({ ...errors, fullName: '' });
            }}
            error={!!errors.fullName}
            helperText={errors.fullName}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.emailId}
            onChange={(e) => {
              setFormData({ ...formData, emailId: e.target.value });
              setErrors({ ...errors, emailId: '' });
            }}
            error={!!errors.emailId}
            helperText={errors.emailId}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value });
              setErrors({ ...errors, password: '' });
            }}
            error={!!errors.password}
            helperText={errors.password}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    onClick={() => setShowPassword(!showPassword)}
                    sx={{ minWidth: 'auto', p: 1 }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </Button>
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PersonAddIcon />}
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
                },
                textTransform: 'none',
                fontWeight: 600,
                flex: 1,
              }}
            >
              {loading ? 'Creating...' : 'Create Admin'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/dashboard')}
              disabled={loading}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </form>
    </Card>
  );
};

export default CreateAdminPage;

