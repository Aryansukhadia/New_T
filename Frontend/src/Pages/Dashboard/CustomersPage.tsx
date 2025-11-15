import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  People as PeopleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  Straighten as StraightenIcon,
} from '@mui/icons-material';
import {
  getCustomersService,
  deleteCustomerService,
  type Customer,
} from '../../Services/ApiServices';
import { useToast } from '../../Utils/ToastContext';

const CustomersPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getCustomersService();
      if (response.success === 200 && response.data) {
        setCustomers(response.data);
      } else {
        showError(response.message || 'Failed to load customers', 'Error');
      }
    } catch (err: unknown) {
      console.error('Error fetching customers:', err);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        showError(axiosError.response?.data?.message || 'Failed to load customers', 'Error');
      } else {
        showError('Failed to load customers. Please try again.', 'Error');
      }
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCustomers(customers);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = customers.filter(
      (customer) =>
        customer.fullName.toLowerCase().includes(term) ||
        customer.emailId.toLowerCase().includes(term) ||
        customer.mobileNo.toLowerCase().includes(term) ||
        customer.address.toLowerCase().includes(term) ||
        (customer.reference && customer.reference.toLowerCase().includes(term))
    );
    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  const handleAddCustomer = () => {
    navigate('/dashboard/customers/create');
  };

  const handleEditCustomer = (customer: Customer) => {
    navigate(`/dashboard/customers/edit/${customer.customerId}`);
  };

  const handleOpenDeleteModal = (customer: Customer) => {
    setCustomerToDelete(customer);
    setIsDeleteModalOpen(true);
  };

  const handleManageMeasurements = (customer: Customer) => {
    navigate(`/dashboard/measurements/manage/${customer.customerId}`);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCustomerToDelete(null);
  };

  const handleDelete = async () => {
    if (!customerToDelete) return;

    setDeleteLoading(true);

    try {
      const response = await deleteCustomerService(customerToDelete.customerId);

      if (response.success === 200) {
        showSuccess(response.message || 'Customer deleted successfully!', 'Success');
        await fetchCustomers();
        setTimeout(() => {
          handleCloseDeleteModal();
        }, 800);
      } else {
        const errorMsg = response.message || 'Failed to delete customer';
        showError(errorMsg, 'Delete Failed');
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        const errorMsg = axiosError.response?.data?.message || 'Failed to delete customer';
        showError(errorMsg, 'Delete Failed');
      } else {
        const errorMsg = 'An unexpected error occurred';
        showError(errorMsg, 'Delete Failed');
      }
    } finally {
      setDeleteLoading(false);
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
          Customer Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={handleAddCustomer}
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
          Add New Customer
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search customers by name, email, mobile, address, or reference..."
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
      ) : filteredCustomers.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <PeopleIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
          <Typography variant="body1">
            {searchTerm
              ? 'No customers found matching your search'
              : 'No customers found. Add your first customer to get started!'}
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead sx={{ bgcolor: '#f8f9fa' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Mobile</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Address</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Reference</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Created At</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.customerId} hover>
                  <TableCell>{customer.fullName}</TableCell>
                  <TableCell>{customer.emailId}</TableCell>
                  <TableCell>{customer.mobileNo}</TableCell>
                  <TableCell>{customer.address}</TableCell>
                  <TableCell>{customer.reference || '—'}</TableCell>
                  <TableCell>{formatDate(customer.createdAt)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleManageMeasurements(customer)}
                        title="Manage Measurements"
                        sx={{
                          bgcolor: '#fff3e0',
                          color: '#f57c00',
                          '&:hover': {
                            bgcolor: '#ffe0b2',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 8px rgba(245, 124, 0, 0.2)',
                          },
                        }}
                      >
                        <StraightenIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEditCustomer(customer)}
                        title="Edit Customer"
                        sx={{
                          bgcolor: '#e3f2fd',
                          color: '#1976d2',
                          '&:hover': {
                            bgcolor: '#bbdefb',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 8px rgba(25, 118, 210, 0.2)',
                          },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDeleteModal(customer)}
                        title="Delete Customer"
                        sx={{
                          bgcolor: '#ffebee',
                          color: '#d32f2f',
                          '&:hover': {
                            bgcolor: '#ffcdd2',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 8px rgba(211, 47, 47, 0.2)',
                          },
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteModalOpen} onClose={handleCloseDeleteModal} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Customer</DialogTitle>
        <DialogContent>
          {customerToDelete && (
            <Typography>
              Are you sure you want to delete customer <strong>{customerToDelete.fullName}</strong> (
              {customerToDelete.emailId})? This action will soft delete the customer and cannot be
              undone.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCloseDeleteModal}
            variant="outlined"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={deleteLoading}
            variant="contained"
            color="error"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {deleteLoading ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default CustomersPage;
