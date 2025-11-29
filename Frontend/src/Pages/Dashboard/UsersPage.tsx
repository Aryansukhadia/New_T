import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import MUICustomBtn from '../../Components/Common/MUICustomBtn';
import DataTable, { type Column } from '../../Components/Common/DataTable';
import DataCardGrid, { type CardField, type CardAction } from '../../Components/Common/DataCardGrid';
import {
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountCircle as AccountCircleIcon,
  FilterList as FilterListIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
} from '@mui/icons-material';
import {
  getUsersService,
  deleteUserService,
  getUserInfo,
  type UserResponse,
  type PaginationMeta,
} from '../../Services/ApiServices';
import { useToast } from '../../Utils/ToastContext';
import { getRoleColor } from '../../Utils/roles';

const UsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserResponse | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const { showSuccess, showError } = useToast();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);

  const currentUser = getUserInfo();

  const fetchUsers = async (page: number = 0) => {
    try {
      setLoading(true);
      const apiPage = page + 1;
      const response = await getUsersService(apiPage, pageSize);
      if (response.success === 200 && response.data) {
        const { users: usersData, pagination } = response.data;
        setUsers(usersData);
        setPaginationMeta(pagination);
        setCurrentPage(page);
      }
    } catch (err: unknown) {
      console.error('Error fetching users:', err);
      showError('Failed to load users', 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

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
        user.role.toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleAddUser = () => {
    navigate('/dashboard/users/create');
  };

  const handleEditUser = (user: UserResponse) => {
    navigate(`/dashboard/users/edit/${user.userId}`);
  };

  const handleViewProfile = (user: UserResponse) => {
    navigate(`/dashboard/users/${user.userId}`);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const handleOpenDeleteModal = (user: UserResponse) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
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

  // Table columns configuration
  const columns: Column<UserResponse>[] = [
    {
      id: 'name',
      label: 'Name',
      render: (user) => user.fullName,
    },
    {
      id: 'email',
      label: 'Email',
      render: (user) => user.emailId,
    },
    {
      id: 'role',
      label: 'Role',
      render: (user) => {
        const { bgcolor, color } = getRoleColor(user.role);
        return (
          <Chip
            label={user.role}
            size="small"
            sx={{
              bgcolor,
              color,
              fontWeight: 600,
            }}
          />
        );
      },
    },
    {
      id: 'createdAt',
      label: 'Created At',
      render: (user) => formatDate(user.createdAt),
    },
    {
      id: 'actions',
      label: 'Actions',
      render: (user) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <MUICustomBtn
            onClick={() => handleViewProfile(user)}
            tooltip="View Profile"
            variant="contained"
            sx={{
              bgcolor: '#f3e5f5',
              color: '#9c27b0',
              minWidth: 32,
              width: 32,
              height: 32,
              padding: 0,
              '&:hover': {
                bgcolor: '#e1bee7',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(156, 39, 176, 0.2)',
              },
            }}
          >
            <AccountCircleIcon fontSize="small" />
          </MUICustomBtn>
          <MUICustomBtn
            onClick={() => handleEditUser(user)}
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
      ),
    },
  ];

  // Card fields configuration
  const cardFields: CardField<UserResponse>[] = [
    {
      id: 'email',
      label: 'Email',
      render: (user) => (
        <Typography variant="body2" color="text.secondary">
          {user.emailId}
        </Typography>
      ),
    },
    {
      id: 'role',
      label: 'Role',
      render: (user) => {
        const { bgcolor, color } = getRoleColor(user.role);
        return (
          <Chip
            label={user.role}
            size="small"
            sx={{
              bgcolor,
              color,
              fontWeight: 600,
            }}
          />
        );
      },
    },
    {
      id: 'createdAt',
      label: 'Created At',
      render: (user) => (
        <Typography variant="body2" color="text.secondary">
          {formatDate(user.createdAt)}
        </Typography>
      ),
    },
  ];

  // Card actions configuration
  const cardActions: CardAction<UserResponse>[] = [
    {
      id: 'view',
      render: (user) => (
        <MUICustomBtn
          onClick={() => handleViewProfile(user)}
          tooltip="View Profile"
          variant="contained"
          sx={{
            bgcolor: '#f3e5f5',
            color: '#9c27b0',
            minWidth: 32,
            width: 32,
            height: 32,
            padding: 0,
            '&:hover': {
              bgcolor: '#e1bee7',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 8px rgba(156, 39, 176, 0.2)',
            },
          }}
        >
          <AccountCircleIcon fontSize="small" />
        </MUICustomBtn>
      ),
    },
    {
      id: 'edit',
      render: (user) => (
        <MUICustomBtn
          onClick={() => handleEditUser(user)}
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
      ),
    },
    {
      id: 'delete',
      render: (user) => (
        <MUICustomBtn
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
      ),
    },
  ];

  return (
    <Card sx={{ borderRadius: 1.5, p: { xs: 2, sm: 3 } }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2
      }}>
        <Typography variant="h5" sx={{
          fontWeight: 700,
          fontSize: { xs: '1.25rem', sm: '1.5rem' }
        }}>
          User Management
        </Typography>
        <Box sx={{
          display: 'flex',
          gap: 1.5,
          flexWrap: 'wrap',
          width: { xs: '100%', sm: 'auto' },
          alignItems: 'center'
        }}>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilter(!showFilter)}
            sx={{
              borderColor: showFilter ? '#667eea' : '#e0e0e0',
              borderWidth: 1.5,
              color: showFilter ? '#667eea' : '#666',
              bgcolor: showFilter ? 'rgba(102, 126, 234, 0.08)' : 'transparent',
              '&:hover': {
                borderColor: '#667eea',
                bgcolor: 'rgba(102, 126, 234, 0.12)',
                transform: 'translateY(-1px)',
                boxShadow: '0 2px 4px rgba(102, 126, 234, 0.2)',
              },
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              px: 2,
              py: 1,
              borderRadius: 1.5,
              transition: 'all 0.2s ease',
            }}
          >
            {showFilter ? 'Hide Filter' : 'Show Filter'}
          </Button>
          {/* Hide view toggle button on screens < 1024px */}
          <Button
            variant="outlined"
            startIcon={viewMode === 'table' ? <ViewModuleIcon /> : <ViewListIcon />}
            onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}
            sx={{
              borderColor: '#e0e0e0',
              borderWidth: 1.5,
              color: '#666',
              bgcolor: 'transparent',
              '&:hover': {
                borderColor: '#667eea',
                bgcolor: 'rgba(102, 126, 234, 0.12)',
                transform: 'translateY(-1px)',
                boxShadow: '0 2px 4px rgba(102, 126, 234, 0.2)',
              },
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              px: 2,
              py: 1,
              borderRadius: 1.5,
              transition: 'all 0.2s ease',
              display: { xs: 'none', lg: 'flex' }, // Hide on screens < 1024px
            }}
          >
            {viewMode === 'table' ? 'Card View' : 'Table View'}
          </Button>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={handleAddUser}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
              },
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              px: 2.5,
              py: 1,
              borderRadius: 1.5,
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              minWidth: { xs: 'auto', sm: 140 },
            }}
          >
            Add New User
          </Button>
        </Box>
      </Box>

      {showFilter && (
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search users by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            sx={{
              maxWidth: { xs: '100%', sm: 500 },
              '& .MuiInputBase-input': {
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }
            }}
          />
        </Box>
      )}

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
        <>
          {/* Desktop view - show table or card based on viewMode */}
          <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
            {viewMode === 'table' ? (
              <DataTable
                columns={columns}
                data={filteredUsers}
                getRowKey={(user) => user.userId}
                paginationMeta={paginationMeta}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={(_event, page) => setCurrentPage(page)}
                onRowsPerPageChange={(event) => {
                  const newRowsPerPage = parseInt(event.target.value, 10);
                  const actualRowsPerPage = newRowsPerPage === -1 ? 10000 : newRowsPerPage;
                  setPageSize(actualRowsPerPage);
                  setCurrentPage(0);
                }}
                searchTerm={searchTerm}
              />
            ) : (
              <DataCardGrid
                data={filteredUsers}
                getCardTitle={(user) => user.fullName}
                getCardSubtitle={(user) => user.emailId}
                fields={cardFields}
                actions={cardActions}
                getRowKey={(user) => user.userId}
                paginationMeta={paginationMeta}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={(_event, page) => setCurrentPage(page)}
                onRowsPerPageChange={(event) => {
                  const newRowsPerPage = parseInt(event.target.value, 10);
                  const actualRowsPerPage = newRowsPerPage === -1 ? 10000 : newRowsPerPage;
                  setPageSize(actualRowsPerPage);
                  setCurrentPage(0);
                }}
                searchTerm={searchTerm}
                columns={3}
              />
            )}
          </Box>

          {/* Mobile/Tablet view - always show card view on screens < 1024px */}
          <Box sx={{ display: { xs: 'block', lg: 'none' } }}>
            <DataCardGrid
              data={filteredUsers}
              getCardTitle={(user) => user.fullName}
              getCardSubtitle={(user) => user.emailId}
              fields={cardFields}
              actions={cardActions}
              getRowKey={(user) => user.userId}
              paginationMeta={paginationMeta}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={(_event, page) => setCurrentPage(page)}
              onRowsPerPageChange={(event) => {
                const newRowsPerPage = parseInt(event.target.value, 10);
                const actualRowsPerPage = newRowsPerPage === -1 ? 10000 : newRowsPerPage;
                setPageSize(actualRowsPerPage);
                setCurrentPage(0);
              }}
              searchTerm={searchTerm}
              columns={1}
            />
          </Box>
        </>
      )}

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
