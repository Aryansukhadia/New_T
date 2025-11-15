import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Select,
  MUICustomBtn,
  LoadingSpinner,
} from '../Components/Common/FormComponents';
import { useToast } from '../Utils/ToastContext';
import { createUserByAdminService, getRolesService, type Role } from '../Services/ApiServices';
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

const AdminCreateUser = () => {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    emailId: '',
    password: '',
    roleId: '',
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await getRolesService();
        if (response.success === 200 && response.data) {
          setRoles(response.data);
        }
      } catch (err) {
        console.error('Error fetching roles:', err);
        showError('Failed to load roles. Please refresh the page.', 'Error');
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchRoles();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      const response = await createUserByAdminService(formData);

      if (response.success === 201 && response.data) {
        showSuccess('User created successfully!', 'Success');
        // Reset form
        setFormData({
          fullName: '',
          emailId: '',
          password: '',
          roleId: '',
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
          <FormGroup>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter full name"
              required
              disabled={loading}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="emailId">Email Address</Label>
            <Input
              type="email"
              id="emailId"
              name="emailId"
              value={formData.emailId}
              onChange={handleChange}
              placeholder="Enter email address"
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
                placeholder="Create a password"
                required
                disabled={loading}
                minLength={6}
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

          <FormGroup>
            <Label htmlFor="roleId">Role</Label>
            <Select
              id="roleId"
              name="roleId"
              value={formData.roleId}
              onChange={handleChange}
              required
              disabled={loading || loadingRoles}
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role.roleId} value={role.roleId}>
                  {role.roleName}
                </option>
              ))}
            </Select>
          </FormGroup>

          <MUICustomBtn
            type="submit"
            disabled={loading || loadingRoles}
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

