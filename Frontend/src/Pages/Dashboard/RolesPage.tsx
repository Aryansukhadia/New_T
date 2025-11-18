import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import {
  getRolesService,
  createRoleService,
  updateRoleService,
  deleteRoleService,
  type Role,
} from '../../Services/ApiServices/roleServices';
import { useToast } from '../../Utils/ToastContext';

const RolesPage = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState('');

  const { showSuccess, showError } = useToast();

  // Fetch all roles
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await getRolesService();
      if (response.success === 200 && response.data) {
        setRoles(response.data);
      } else {
        showError(response.message || 'Failed to load roles', 'Error');
      }
    } catch (err: unknown) {
      console.error('Error fetching roles:', err);
      showError('Failed to load roles. Please try again.', 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Open Add Dialog
  const handleOpenAddDialog = () => {
    setEditingRole(null);
    setRoleName('');
    setOpenDialog(true);
  };

  // Open Edit Dialog
  const handleOpenEditDialog = (role: Role) => {
    setEditingRole(role);
    setRoleName(role.roleName);
    setOpenDialog(true);
  };

  // Close Dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRole(null);
    setRoleName('');
  };

  // Handle Save (Create or Update)
  const handleSave = async () => {
    if (!roleName.trim()) {
      showError('Role name is required', 'Validation Error');
      return;
    }

    setFormLoading(true);
    try {
      if (editingRole) {
        // Update existing role
        const response = await updateRoleService(editingRole.roleId, { roleName });
        if (response.success === 200) {
          showSuccess('Role updated successfully!', 'Success');
          handleCloseDialog();
          await fetchRoles();
        } else {
          showError(response.message || 'Failed to update role', 'Error');
        }
      } else {
        // Create new role
        const response = await createRoleService({ roleName });
        if (response.success === 201) {
          showSuccess('Role created successfully!', 'Success');
          handleCloseDialog();
          await fetchRoles();
        } else {
          showError(response.message || 'Failed to create role', 'Error');
        }
      }
    } catch (err: unknown) {
      console.error('Error saving role:', err);
      showError('An error occurred while saving the role', 'Error');
    } finally {
      setFormLoading(false);
    }
  };

  // Open Delete Dialog
  const handleOpenDeleteDialog = (role: Role) => {
    setDeletingRole(role);
    setOpenDeleteDialog(true);
  };

  // Close Delete Dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDeletingRole(null);
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!deletingRole) return;

    setFormLoading(true);
    try {
      const response = await deleteRoleService(deletingRole.roleId);
      if (response.success === 200) {
        showSuccess('Role deleted successfully!', 'Success');
        handleCloseDeleteDialog();
        await fetchRoles();
      } else {
        showError(response.message || 'Failed to delete role', 'Error');
      }
    } catch (err: unknown) {
      console.error('Error deleting role:', err);
      showError('An error occurred while deleting the role', 'Error');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <Card sx={{ borderRadius: 1.5, p: 3 }}>
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      </Card>
    );
  }

  return (
    <>
      <Card sx={{ borderRadius: 1.5, p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
            <AdminIcon color="primary" />
            Roles Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
              },
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Add Role
          </Button>
        </Box>

        {/* Roles Table */}
        {roles.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 6,
              border: '2px dashed #e0e0e0',
              borderRadius: 1,
              bgcolor: '#f9f9f9',
            }}
          >
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              No roles found. Click "Add Role" to create one.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Role ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Role Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Created At</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.map((role) => (
                  <TableRow
                    key={role.roleId}
                    sx={{
                      '&:hover': { bgcolor: '#f9f9f9' },
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <TableCell>
                      <Chip label={role.roleId} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600 }}>{role.roleName}</Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(role.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEditDialog(role)}
                          sx={{
                            color: 'primary.main',
                            '&:hover': { bgcolor: 'primary.light' },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDeleteDialog(role)}
                          sx={{
                            color: 'error.main',
                            '&:hover': { bgcolor: 'error.light' },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {editingRole ? 'Edit Role' : 'Add New Role'}
          </Typography>
          <IconButton onClick={handleCloseDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Role Name"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            placeholder="Enter role name (e.g., Admin, Manager, Tailor)"
            disabled={formLoading}
            autoFocus
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCloseDialog}
            disabled={formLoading}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={formLoading}
            startIcon={formLoading ? <CircularProgress size={20} /> : undefined}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
              },
              textTransform: 'none',
              fontWeight: 600,
              minWidth: 100,
            }}
          >
            {formLoading ? '' : editingRole ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the role "<strong>{deletingRole?.roleName}</strong>"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCloseDeleteDialog}
            disabled={formLoading}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={formLoading}
            startIcon={formLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {formLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RolesPage;