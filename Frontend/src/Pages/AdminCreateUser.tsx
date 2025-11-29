import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { IconButton, InputAdornment, TextField, MenuItem } from '@mui/material';
import {
  FormContainer,
  FormCard,
  FormTitle,
  FormSubtitle,
  Form,
  LoadingSpinner,
} from '../Components/Common/FormComponents';
import { useToast } from '../Utils/ToastContext';
import { createUserByAdminService } from '../Services/ApiServices';
import axios from 'axios';
import MUICustomBtn from '../Components/Common/MUICustomBtn';

const AdminCreateUser = () => {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    emailId: '',
    password: '',
    role: '' as 'superAdmin' | 'admin' | 'subAdmin' | 'cutter' | 'stitcher' | 'finisher' | 'deliveryBoy' | 'accountant' | '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      const response = await createUserByAdminService({
        fullName: formData.fullName,
        emailId: formData.emailId,
        password: formData.password,
        role: formData.role as 'superAdmin' | 'admin' | 'subAdmin' | 'cutter' | 'stitcher' | 'finisher' | 'deliveryBoy' | 'accountant',
      });

      if (response.success === 201 && response.data) {
        showSuccess('User created successfully!', 'Success');
        // Reset form
        setFormData({
          fullName: '',
          emailId: '',
          password: '',
          role: '',
        });
      } else {
        showError(response.message || 'Failed to create user', 'Create Failed');
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errorMsg = err.response?.data?.message || 'Failed to create user. Please try again.';
        showError(errorMsg, 'Create Failed');
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
        <FormTitle>Create New User</FormTitle>
        <FormSubtitle>Admin - Create a new user account</FormSubtitle>

        <Form onSubmit={handleSubmit}>
          <TextField
            type="text"
            id="fullName"
            name="fullName"
            label="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter full name"
            required
            disabled={loading}
            fullWidth
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                background: '#fafafa',
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                '& fieldset': {
                  borderColor: '#e0e0e0',
                  borderWidth: 2,
                },
                '&:hover fieldset': {
                  borderColor: '#ccc',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#667eea',
                  boxShadow: '0 0 0 4px rgba(102, 126, 234, 0.1)',
                },
                '&.Mui-focused': {
                  background: 'white',
                  transform: 'translateY(-1px)',
                },
              },
            }}
          />

          <TextField
            type="email"
            id="emailId"
            name="emailId"
            label="Email Address"
            value={formData.emailId}
            onChange={handleChange}
            placeholder="Enter email address"
            required
            disabled={loading}
            fullWidth
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                background: '#fafafa',
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                '& fieldset': {
                  borderColor: '#e0e0e0',
                  borderWidth: 2,
                },
                '&:hover fieldset': {
                  borderColor: '#ccc',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#667eea',
                  boxShadow: '0 0 0 4px rgba(102, 126, 234, 0.1)',
                },
                '&.Mui-focused': {
                  background: 'white',
                  transform: 'translateY(-1px)',
                },
              },
            }}
          />

          <TextField
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            label="Password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
            required
            disabled={loading}
            fullWidth
            variant="outlined"
            inputProps={{
              minLength: 6,
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    edge="end"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                background: '#fafafa',
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                '& fieldset': {
                  borderColor: '#e0e0e0',
                  borderWidth: 2,
                },
                '&:hover fieldset': {
                  borderColor: '#ccc',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#667eea',
                  boxShadow: '0 0 0 4px rgba(102, 126, 234, 0.1)',
                },
                '&.Mui-focused': {
                  background: 'white',
                  transform: 'translateY(-1px)',
                },
              },
            }}
          />

          <TextField
            select
            id="role"
            name="role"
            label="Role"
            value={formData.role}
            onChange={handleChange}
            required
            disabled={loading}
            fullWidth
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                background: '#fafafa',
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                '& fieldset': {
                  borderColor: '#e0e0e0',
                  borderWidth: 2,
                },
                '&:hover fieldset': {
                  borderColor: '#ccc',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#667eea',
                  boxShadow: '0 0 0 4px rgba(102, 126, 234, 0.1)',
                },
                '&.Mui-focused': {
                  background: 'white',
                  transform: 'translateY(-1px)',
                },
              },
            }}
          >
            <MenuItem value="">Select a role</MenuItem>
            <MenuItem value="superAdmin">SuperAdmin</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="subAdmin">SubAdmin</MenuItem>
            <MenuItem value="cutter">Cutter</MenuItem>
            <MenuItem value="stitcher">Stitcher</MenuItem>
            <MenuItem value="finisher">Finisher</MenuItem>
            <MenuItem value="deliveryBoy">Delivery Boy</MenuItem>
            <MenuItem value="accountant">Accountant</MenuItem>
          </TextField>

          <MUICustomBtn
            type="submit"
            disabled={loading}
            tooltip="Create new user account"
            fullWidth
          >
            {loading ? <LoadingSpinner /> : 'Create User'}
          </MUICustomBtn>
        </Form>

        <MUICustomBtn
          onClick={() => navigate(-1)}
          tooltip="Go back to previous page"
          variant="outlined"
          color="secondary"
          sx={{ marginTop: '12px' }}
          fullWidth
        >
          Go Back
        </MUICustomBtn>
      </FormCard>
    </FormContainer>
  );
};

export default AdminCreateUser;

