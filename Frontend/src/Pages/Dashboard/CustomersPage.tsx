import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  getCustomersService,
  deleteCustomerService,
  type Customer,
} from '../../Services/ApiServices';
import Modal from '../../Components/Common/Modal';
import { useToast } from '../../Utils/ToastContext';
import { Button, LoadingSpinner } from '../../Components/Common/FormComponents';
import {
  FaUsers,
  FaEdit,
  FaTrash,
  FaUserPlus,
  FaRuler,
} from 'react-icons/fa';

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
    background: ${(props) => (props.isHeader ? 'none' : '#f8f9fa')};
  }
`;

const TableCell = styled.td<{ isHeader?: boolean }>`
  padding: 16px;
  text-align: left;
  font-weight: ${(props) => (props.isHeader ? '600' : '400')};
  color: ${(props) => (props.isHeader ? '#666' : '#333')};
  font-size: 14px;
`;

const TableHeaderCell = styled(TableCell).attrs({ isHeader: true })`
  background: #f8f9fa;
`;

const ActionCell = styled(TableCell)`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button<{ variant?: 'edit' | 'delete' | 'measurement' }>`
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

  ${(props) => {
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
    if (props.variant === 'measurement') {
      return `
        background: #fff3e0;
        color: #f57c00;
        &:hover {
          background: #ffe0b2;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(245, 124, 0, 0.2);
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
    <PageContainer>
      <PageHeader>
        <PageTitle>Customer Management</PageTitle>
        <ActionButton onClick={handleAddCustomer}>
          <FaUserPlus style={{ marginRight: '8px' }} />
          Add New Customer
        </ActionButton>
      </PageHeader>

      <SearchBar>
        <SearchInput
          type="text"
          placeholder="Search customers by name, email, mobile, address, or reference..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchBar>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <LoadingSpinner />
        </div>
      ) : filteredCustomers.length === 0 ? (
        <EmptyState>
          <EmptyStateIcon>
            <FaUsers />
          </EmptyStateIcon>
          <EmptyStateText>
            {searchTerm
              ? 'No customers found matching your search'
              : 'No customers found. Add your first customer to get started!'}
          </EmptyStateText>
        </EmptyState>
      ) : (
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow isHeader>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Mobile</TableHeaderCell>
                <TableHeaderCell>Address</TableHeaderCell>
                <TableHeaderCell>Reference</TableHeaderCell>
                <TableHeaderCell>Created At</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <tbody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.customerId}>
                  <TableCell>{customer.fullName}</TableCell>
                  <TableCell>{customer.emailId}</TableCell>
                  <TableCell>{customer.mobileNo}</TableCell>
                  <TableCell>{customer.address}</TableCell>
                  <TableCell>{customer.reference || '—'}</TableCell>
                  <TableCell>{formatDate(customer.createdAt)}</TableCell>
                  <ActionCell>
                    <IconButton
                      variant="measurement"
                      onClick={() => handleManageMeasurements(customer)}
                      title="Manage Measurements"
                    >
                      <FaRuler />
                    </IconButton>
                    <IconButton
                      variant="edit"
                      onClick={() => handleEditCustomer(customer)}
                      title="Edit Customer"
                    >
                      <FaEdit />
                    </IconButton>
                    <IconButton
                      variant="delete"
                      onClick={() => handleOpenDeleteModal(customer)}
                      title="Delete Customer"
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        title="Delete Customer"
        footer={
          <>
            <ModalButtonSecondary onClick={handleCloseDeleteModal}>Cancel</ModalButtonSecondary>
            <Button
              onClick={handleDelete}
              disabled={deleteLoading}
              style={{ background: '#dc3545', marginTop: 0 }}
            >
              {deleteLoading ? <LoadingSpinner /> : 'Delete'}
            </Button>
          </>
        }
      >
        {customerToDelete && (
          <p>
            Are you sure you want to delete customer <strong>{customerToDelete.fullName}</strong> (
            {customerToDelete.emailId})? This action will soft delete the customer and cannot be
            undone.
          </p>
        )}
      </Modal>
    </PageContainer>
  );
};

export default CustomersPage;
