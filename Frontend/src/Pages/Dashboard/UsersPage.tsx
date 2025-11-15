import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import MUICustomBtn from '../../Components/Common/MUICustomBtn';
import {
  People as PeopleIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import {
  getUsersService,
  updateUserService,
  deleteUserService,
  createUserByAdminService,
  getRolesService,
  getUserInfo,
  type UserResponse,
  type Role,
} from '../../Services/ApiServices';
import { useToast } from '../../Utils/ToastContext';

const UsersPage = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserResponse[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserResponse | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    fullName: '',
    emailId: '',
    password: '',
    roleId: '',
  });

  const currentUser = getUserInfo();

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.fullName.toLowerCase().includes(term) ||
        user.emailId.toLowerCase().includes(term) ||
        user.role.roleName.toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsersService();
      if (response.success === 200 && response.data) {
        setUsers(response.data);
      }
    } catch (err: unknown) {
      console.error('Error fetching users:', err);
      showError('Failed to load users', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await getRolesService();
      if (response.success === 200 && response.data) {
        setRoles(response.data);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };


  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setSelectedUser(null);
    setFormData({
      fullName: '',
      emailId: '',
      password: '',
      roleId: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: UserResponse) => {
    setIsEditMode(true);
    setSelectedUser(user);
    setFormData({
      fullName: user.fullName,
      emailId: user.emailId,
      password: '', // Don't populate password for edit
      roleId: user.roleId,
    });
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (user: UserResponse) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    if (!name) return;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (isEditMode && selectedUser) {
        // Update user (only fullName can be updated currently based on backend)
        const response = await updateUserService(selectedUser.userId, {
          fullName: formData.fullName,
        });

        if (response.success === 200) {
          showSuccess('User updated successfully!', 'Success');
          await fetchUsers();
          setTimeout(() => {
            handleCloseModal();
          }, 1500);
        } else {
          showError(response.message || 'Failed to update user', 'Update Failed');
        }
      } else {
        // Create new user
        const response = await createUserByAdminService({
          fullName: formData.fullName,
          emailId: formData.emailId,
          password: formData.password,
          roleId: formData.roleId,
        });

        if (response.success === 201) {
          showSuccess('User created successfully!', 'Success');
          await fetchUsers();
          setTimeout(() => {
            handleCloseModal();
          }, 1500);
        } else {
          showError(response.message || 'Failed to create user', 'Create Failed');
        }
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        showError(axiosError.response?.data?.message || 'An error occurred', 'Error');
      } else {
        showError('An unexpected error occurred', 'Error');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    setFormLoading(true);

    try {
      const response = await deleteUserService(userToDelete.userId);

      if (response.success === 200) {
        showSuccess('User deleted successfully!', 'Success');
        await fetchUsers();
        setTimeout(() => {
          handleCloseDeleteModal();
        }, 1500);
      } else {
        showError(response.message || 'Failed to delete user', 'Delete Failed');
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        showError(axiosError.response?.data?.message || 'Failed to delete user', 'Delete Failed');
      } else {
        showError('An unexpected error occurred', 'Error');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card sx={{ borderRadius: 1.5, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={handleOpenCreateModal}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            },
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Add New User
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search users by name, email, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="outlined"
          sx={{ maxWidth: 500 }}
        />
      </Box>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : filteredUsers.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <PeopleIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
          <Typography variant="body1">
            {searchTerm ? 'No users found matching your search' : 'No users found'}
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead sx={{ bgcolor: '#f8f9fa' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Created At</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.userId} hover>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.emailId}</TableCell>
                  <TableCell>{user.role.roleName}</TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <MUICustomBtn
                        size="small"
                        onClick={() => handleOpenEditModal(user)}
                        disabled={user.userId === currentUser?.userId}
                        tooltip="Edit User"
                        variant="contained"
                        sx={{
                          bgcolor: '#e3f2fd',
                          color: '#1976d2',
                          minWidth: 32,
                          width: 32,
                          height: 32,
                          padding: 0,
                          '&:hover': {
                            bgcolor: '#bbdefb',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 8px rgba(25, 118, 210, 0.2)',
                          },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </MUICustomBtn>
                      <MUICustomBtn
                        size="small"
                        onClick={() => handleOpenDeleteModal(user)}
                        disabled={user.userId === currentUser?.userId}
                        tooltip="Delete User"
                        variant="contained"
                        sx={{
                          bgcolor: '#ffebee',
                          color: '#d32f2f',
                          minWidth: 32,
                          width: 32,
                          height: 32,
                          padding: 0,
                          '&:hover': {
                            bgcolor: '#ffcdd2',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 8px rgba(211, 47, 47, 0.2)',
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </MUICustomBtn>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditMode ? 'Edit User' : 'Create New User'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              fullWidth
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter full name (e.g., John Doe)"
              required
              disabled={formLoading}
              InputProps={{
                startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />

            <TextField
              fullWidth
              type="email"
              label="Email Address"
              name="emailId"
              value={formData.emailId}
              onChange={handleInputChange}
              placeholder="Enter email address (e.g., john.doe@example.com)"
              required
              disabled={formLoading || isEditMode}
              InputProps={{
                startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
              helperText={isEditMode ? 'Email address cannot be modified after account creation' : ''}
            />

            {!isEditMode && (
              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                label="Password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password (minimum 6 characters)"
                required
                disabled={formLoading}
                inputProps={{ minLength: 6 }}
                InputProps={{
                  startAdornment: <LockIcon sx={{ mr: 1, color: 'action.active' }} />,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={formLoading}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                helperText="Password must be at least 6 characters long"
              />
            )}

            <TextField
              fullWidth
              select
              label="Role"
              name="roleId"
              value={formData.roleId}
              onChange={(event) => handleSelectChange(event as SelectChangeEvent<string>)}
              required
              disabled={formLoading}
            >
              <MenuItem value="">-- Select a role --</MenuItem>
              {roles.map((role) => (
                <MenuItem key={role.roleId} value={role.roleId}>
                  {role.roleName}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseModal} variant="outlined" sx={{ textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={formLoading}
            variant="contained"
            startIcon={isEditMode ? <EditIcon /> : <PersonAddIcon />}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
              },
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {formLoading ? <CircularProgress size={20} color="inherit" /> : isEditMode ? 'Update User' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteModalOpen} onClose={handleCloseDeleteModal} maxWidth="sm" fullWidth>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          {userToDelete && (
            <Typography>
              Are you sure you want to delete user <strong>{userToDelete.fullName}</strong> (
              {userToDelete.emailId})? This action cannot be undone.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDeleteModal} variant="outlined" sx={{ textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={formLoading}
            variant="contained"
            color="error"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {formLoading ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default UsersPage;
