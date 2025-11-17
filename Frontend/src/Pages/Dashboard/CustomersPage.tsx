import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
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
} from '@mui/material';
import {
  People as PeopleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  Straighten as StraightenIcon,
} from '@mui/icons-material';
import MUICustomBtn from '../../Components/Common/MUICustomBtn';
import CustomTablePaginationComponent from '../../Components/Common/CustomTablePagination';

import {
  getCustomersService,
  deleteCustomerService,
  type Customer,
  type PaginationMeta,
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0); // MUI TablePagination uses 0-based indexing
  const [pageSize, setPageSize] = useState(10);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);

  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const fetchCustomers = useCallback(async (page: number = 0) => {
    try {
      setLoading(true);
      // Convert from 0-based (MUI) to 1-based (API)
      const apiPage = page + 1;
      const response = await getCustomersService(apiPage, pageSize);
      if (response.success === 200 && response.data) {
        const { customers: customersData, pagination } = response.data;
        setCustomers(customersData);
        setPaginationMeta(pagination);
        setCurrentPage(page);
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
  }, [showError, pageSize]);

  useEffect(() => {
    fetchCustomers(currentPage);
  }, [fetchCustomers, currentPage]);

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

  const handlePageChange = useCallback(
    (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
      setCurrentPage(newPage);
    },
    []
  );

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newRowsPerPage = parseInt(event.target.value, 10);
      // Handle "All" option (-1) by setting a large number that covers all records
      const actualRowsPerPage = newRowsPerPage === -1 ? 10000 : newRowsPerPage;
      setPageSize(actualRowsPerPage);
      setCurrentPage(0); // Reset to first page when changing page size
    },
    []
  );

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
        <MUICustomBtn
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={handleAddCustomer}
          tooltip="Add a new customer to the system"
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
        </MUICustomBtn>
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
      ) : (
        <>
          {filteredCustomers.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
              <PeopleIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
              <Typography variant="body1">
                {searchTerm
                  ? 'No customers found matching your search'
                  : 'No customers found. Add your first customer to get started!'}
              </Typography>
            </Box>
          ) : (
            <>
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
                            <MUICustomBtn
                              onClick={() => handleManageMeasurements(customer)}
                              tooltip="Manage Measurements"
                              variant="contained"
                              sx={{
                                bgcolor: '#fff3e0',
                                color: '#f57c00',
                                minWidth: 32,
                                width: 32,
                                height: 32,
                                padding: 0,
                                '&:hover': {
                                  bgcolor: '#ffe0b2',
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 4px 8px rgba(245, 124, 0, 0.2)',
                                },
                              }}
                            >
                              <StraightenIcon fontSize="small" />
                            </MUICustomBtn>
                            <MUICustomBtn
                              onClick={() => handleEditCustomer(customer)}
                              tooltip="Edit Customer"
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
                              onClick={() => handleOpenDeleteModal(customer)}
                              tooltip="Delete Customer"
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
                  <tfoot>
                    <tr>
                      {/* Pagination Controls - Only show when not searching */}
                      {paginationMeta && (
                        <CustomTablePaginationComponent
                          count={paginationMeta.totalCount}
                          page={currentPage}
                          rowsPerPage={pageSize}
                          onPageChange={handlePageChange}
                          onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                      )}
                    </tr>
                  </tfoot>
                </Table>
              </TableContainer>
            </>
          )}


        </>
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
          <MUICustomBtn
            onClick={handleCloseDeleteModal}
            variant="outlined"
            tooltip="Cancel delete operation"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Cancel
          </MUICustomBtn>
          <MUICustomBtn
            onClick={handleDelete}
            disabled={deleteLoading}
            variant="contained"
            color="error"
            tooltip="Permanently delete this customer"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {deleteLoading ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
          </MUICustomBtn>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default CustomersPage;
