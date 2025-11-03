import { useState, useEffect } from 'react';
import styled from 'styled-components';
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
import Modal from '../../Components/Common/Modal';
import { FormGroup, Label, Input, Select, Button, ErrorMessage, SuccessMessage, LoadingSpinner } from '../../Components/Common/FormComponents';
import { FaUsers, FaUser, FaEnvelope, FaLock, FaUserTag, FaUserPlus, FaEdit, FaTrash } from 'react-icons/fa';

const PageContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0;
`;

const ActionButton = styled.button`
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SearchBar = styled.div`
  margin-bottom: 24px;
`;

const SearchInput = styled.input`
  width: 100%;
  max-width: 400px;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: #f8f9fa;
`;

const TableRow = styled.tr<{ isHeader?: boolean }>`
  border-bottom: 1px solid #e0e0e0;
  
  &:hover {
    background: ${props => props.isHeader ? 'none' : '#f8f9fa'};
  }
`;

const TableCell = styled.td<{ isHeader?: boolean }>`
  padding: 16px;
  text-align: left;
  font-weight: ${props => props.isHeader ? '600' : '400'};
  color: ${props => props.isHeader ? '#666' : '#333'};
  font-size: 14px;
`;

const TableHeaderCell = styled(TableCell).attrs({ isHeader: true })`
  background: #f8f9fa;
`;

const ActionCell = styled(TableCell)`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button<{ variant?: 'edit' | 'delete' }>`
  padding: 10px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  
  ${props => {
    if (props.variant === 'edit') {
      return `
        background: #e3f2fd;
        color: #1976d2;
        &:hover {
          background: #bbdefb;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(25, 118, 210, 0.2);
        }
      `;
    }
    if (props.variant === 'delete') {
      return `
        background: #ffebee;
        color: #d32f2f;
        &:hover {
          background: #ffcdd2;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(211, 47, 47, 0.2);
        }
      `;
    }
    return `
      background: #f5f5f5;
      color: #666;
      &:hover {
        background: #e0e0e0;
      }
    `;
  }}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
`;

const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  color: #ccc;
  display: flex;
  justify-content: center;
  
  svg {
    width: 48px;
    height: 48px;
  }
`;

const EmptyStateText = styled.p`
  font-size: 16px;
  margin: 0;
`;

const ModalButton = styled(Button)`
  margin-top: 0;
  min-width: 140px;
  padding: 14px 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 15px;
  
  svg {
    font-size: 14px;
  }
`;

const ModalButtonSecondary = styled.button`
  padding: 14px 28px;
  background: #f5f5f5;
  color: #333;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
  
  &:hover {
    background: #e8e8e8;
    border-color: #ccc;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formLoading, setFormLoading] = useState(false);

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
      setError('Failed to load users');
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
    setError('');
    setSuccess('');
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
    setError('');
    setSuccess('');
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (user: UserResponse) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setError('');
    setSuccess('');
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
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
    setFormLoading(true);

    try {
      if (isEditMode && selectedUser) {
        // Update user (only fullName can be updated currently based on backend)
        const response = await updateUserService(selectedUser.userId, {
          fullName: formData.fullName,
        });

        if (response.success === 200) {
          setSuccess('User updated successfully!');
          await fetchUsers();
          setTimeout(() => {
            handleCloseModal();
          }, 1500);
        } else {
          setError(response.message || 'Failed to update user');
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
          setSuccess('User created successfully!');
          await fetchUsers();
          setTimeout(() => {
            handleCloseModal();
          }, 1500);
        } else {
          setError(response.message || 'Failed to create user');
        }
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || 'An error occurred');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    setFormLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await deleteUserService(userToDelete.userId);

      if (response.success === 200) {
        setSuccess('User deleted successfully!');
        await fetchUsers();
        setTimeout(() => {
          handleCloseDeleteModal();
        }, 1500);
      } else {
        setError(response.message || 'Failed to delete user');
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || 'Failed to delete user');
      } else {
        setError('An unexpected error occurred');
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
    <PageContainer>
      <PageHeader>
        <PageTitle>User Management</PageTitle>
        <ActionButton onClick={handleOpenCreateModal}>+ Add New User</ActionButton>
      </PageHeader>

      <SearchBar>
        <SearchInput
          type="text"
          placeholder="Search users by name, email, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchBar>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <LoadingSpinner />
        </div>
      ) : filteredUsers.length === 0 ? (
        <EmptyState>
          <EmptyStateIcon>
            <FaUsers />
          </EmptyStateIcon>
          <EmptyStateText>
            {searchTerm ? 'No users found matching your search' : 'No users found'}
          </EmptyStateText>
        </EmptyState>
      ) : (
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow isHeader>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Role</TableHeaderCell>
                <TableHeaderCell>Created At</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <tbody>
              {filteredUsers.map((user) => (
                <TableRow key={user.userId}>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.emailId}</TableCell>
                  <TableCell>{user.role.roleName}</TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <ActionCell>
                    <IconButton
                      variant="edit"
                      onClick={() => handleOpenEditModal(user)}
                      disabled={user.userId === currentUser?.userId}
                      title="Edit User"
                    >
                      <FaEdit />
                    </IconButton>
                    <IconButton
                      variant="delete"
                      onClick={() => handleOpenDeleteModal(user)}
                      disabled={user.userId === currentUser?.userId}
                      title="Delete User"
                    >
                      <FaTrash />
                    </IconButton>
                  </ActionCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isEditMode ? 'Edit User' : 'Create New User'}
        size="large"
        footer={
          <>
            <ModalButtonSecondary onClick={handleCloseModal}>Cancel</ModalButtonSecondary>
            <ModalButton onClick={handleSubmit} disabled={formLoading}>
              {formLoading ? (
                <LoadingSpinner />
              ) : isEditMode ? (
                <>
                  <FaEdit /> Update User
                </>
              ) : (
                <>
                  <FaUserPlus /> Create User
                </>
              )}
            </ModalButton>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}

          <FormGroup>
            <Label htmlFor="fullName">
              <FaUser />
              Full Name
            </Label>
            <Input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleFormChange}
              placeholder="Enter full name (e.g., John Doe)"
              required
              disabled={formLoading}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="emailId">
              <FaEnvelope />
              Email Address
            </Label>
            <Input
              type="email"
              id="emailId"
              name="emailId"
              value={formData.emailId}
              onChange={handleFormChange}
              placeholder="Enter email address (e.g., john.doe@example.com)"
              required
              disabled={formLoading || isEditMode}
            />
            {isEditMode && (
              <p style={{
                fontSize: '13px',
                color: '#999',
                marginTop: '4px',
                fontStyle: 'italic',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e0e0e0'
              }}>
                <FaEnvelope style={{ fontSize: '12px', color: '#667eea' }} />
                Email address cannot be modified after account creation
              </p>
            )}
          </FormGroup>

          {!isEditMode && (
            <FormGroup>
              <Label htmlFor="password">
                <FaLock />
                Password
              </Label>
              <Input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleFormChange}
                placeholder="Enter password (minimum 6 characters)"
                required
                disabled={formLoading}
                minLength={6}
              />
              <p style={{
                fontSize: '12px',
                color: '#666',
                marginTop: '4px',
                paddingLeft: '4px'
              }}>
                Password must be at least 6 characters long
              </p>
            </FormGroup>
          )}

          <FormGroup>
            <Label htmlFor="roleId">
              <FaUserTag />
              Role
            </Label>
            <Select
              id="roleId"
              name="roleId"
              value={formData.roleId}
              onChange={handleFormChange}
              required
              disabled={formLoading}
            >
              <option value="">-- Select a role --</option>
              {roles.map((role) => (
                <option key={role.roleId} value={role.roleId}>
                  {role.roleName}
                </option>
              ))}
            </Select>
          </FormGroup>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        title="Delete User"
        footer={
          <>
            <ModalButtonSecondary onClick={handleCloseDeleteModal}>Cancel</ModalButtonSecondary>
            <Button
              onClick={handleDelete}
              disabled={formLoading}
              style={{ background: '#dc3545', marginTop: 0 }}
            >
              {formLoading ? <LoadingSpinner /> : 'Delete'}
            </Button>
          </>
        }
      >
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
        {!success && (
          <p>
            Are you sure you want to delete user <strong>{userToDelete?.fullName}</strong> (
            {userToDelete?.emailId})? This action cannot be undone.
          </p>
        )}
      </Modal>
    </PageContainer>
  );
};

export default UsersPage;
