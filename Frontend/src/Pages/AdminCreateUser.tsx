import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Button,
  ErrorMessage,
  SuccessMessage,
  LoadingSpinner,
} from '../Components/Common/FormComponents';
import { createUserByAdminService, getRolesService, type Role } from '../Services/ApiServices';

const AdminCreateUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    emailId: '',
    password: '',
    roleId: '',
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await getRolesService();
        if (response.success === 200 && response.data) {
          setRoles(response.data);
        }
      } catch (err) {
        console.error('Error fetching roles:', err);
        setError('Failed to load roles. Please refresh the page.');
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
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await createUserByAdminService(formData);

      if (response.success === 201 && response.data) {
        setSuccess('User created successfully!');
        // Reset form
        setFormData({
          fullName: '',
          emailId: '',
          password: '',
          roleId: '',
        });
      } else {
        setError(response.message || 'Failed to create user');
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || 'Failed to create user. Please try again.');
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
        <FormTitle>Create New User</FormTitle>
        <FormSubtitle>Admin - Create a new user account</FormSubtitle>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

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
            <Input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
              disabled={loading}
              minLength={6}
            />
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

          <Button type="submit" disabled={loading || loadingRoles}>
            {loading ? <LoadingSpinner /> : 'Create User'}
          </Button>
        </Form>

        <Button
          onClick={() => navigate(-1)}
          style={{ marginTop: '12px', background: '#6c757d' }}
        >
          Go Back
        </Button>
      </FormCard>
    </FormContainer>
  );
};

export default AdminCreateUser;

