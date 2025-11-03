import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import {
  getCustomersService,
  createCustomerService,
  updateCustomerService,
  deleteCustomerService,
  type Customer,
  type CreateCustomerRequest,
  type UpdateCustomerRequest,
} from '../../Services/ApiServices';
import Modal from '../../Components/Common/Modal';
import { useToast } from '../../Utils/ToastContext';
import {
  FormGroup,
  Label,
  Input,
  Button,
  LoadingSpinner,
} from '../../Components/Common/FormComponents';
import {
  FaUsers,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaEdit,
  FaTrash,
  FaUserPlus,
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

const CustomersPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState<CreateCustomerRequest>({
    fullName: '',
    emailId: '',
    mobileNo: '',
    address: '',
    reference: null,
  });

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getCustomersService();
      if (response.success === 200 && response.data) {
        setCustomers(response.data);
        // Don't show toast on initial load, only show errors
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

  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setSelectedCustomer(null);
    setFormData({
      fullName: '',
      emailId: '',
      mobileNo: '',
      address: '',
      reference: null,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (customer: Customer) => {
    setIsEditMode(true);
    setSelectedCustomer(customer);
    setFormData({
      fullName: customer.fullName,
      emailId: customer.emailId,
      mobileNo: customer.mobileNo,
      address: customer.address,
      reference: customer.reference || null,
    });
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (customer: Customer) => {
    setCustomerToDelete(customer);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCustomerToDelete(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'reference' ? (value === '' ? null : value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (isEditMode && selectedCustomer) {
        // Update customer
        const updateData: UpdateCustomerRequest = {
          fullName: formData.fullName,
          emailId: formData.emailId,
          mobileNo: formData.mobileNo,
          address: formData.address,
          reference: formData.reference || null,
        };

        const response = await updateCustomerService(selectedCustomer.customerId, updateData);

        if (response.success === 200) {
          showSuccess(response.message || 'Customer updated successfully!', 'Success');
          await fetchCustomers();
          setTimeout(() => {
            handleCloseModal();
          }, 1000);
        } else {
          const errorMsg = response.message || 'Failed to update customer';
          showError(errorMsg, 'Update Failed');
        }
      } else {
        // Create new customer
        const createData: CreateCustomerRequest = {
          fullName: formData.fullName,
          emailId: formData.emailId,
          mobileNo: formData.mobileNo,
          address: formData.address,
          reference: formData.reference || null,
        };

        const response = await createCustomerService(createData);

        if (response.success === 201) {
          showSuccess(response.message || 'Customer created successfully!', 'Success');
          await fetchCustomers();
          setTimeout(() => {
            handleCloseModal();
          }, 1000);
        } else {
          const errorMsg = response.message || 'Failed to create customer';
          showError(errorMsg, 'Create Failed');
        }
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        const errorMsg = axiosError.response?.data?.message || 'An error occurred';
        showError(errorMsg, isEditMode ? 'Update Failed' : 'Create Failed');
      } else {
        const errorMsg = 'An unexpected error occurred';
        showError(errorMsg, isEditMode ? 'Update Failed' : 'Create Failed');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!customerToDelete) return;

    setFormLoading(true);

    try {
      const response = await deleteCustomerService(customerToDelete.customerId);

      if (response.success === 200) {
        showSuccess(response.message || 'Customer deleted successfully!', 'Success');
        await fetchCustomers();
        setTimeout(() => {
          handleCloseDeleteModal();
        }, 1000);
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
        <PageTitle>Customer Management</PageTitle>
        <ActionButton onClick={handleOpenCreateModal}>
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
                      variant="edit"
                      onClick={() => handleOpenEditModal(customer)}
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

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isEditMode ? 'Edit Customer' : 'Create New Customer'}
        size="large"
        footer={
          <>
            <ModalButtonSecondary onClick={handleCloseModal}>Cancel</ModalButtonSecondary>
            <ModalButton onClick={handleSubmit} disabled={formLoading}>
              {formLoading ? (
                <LoadingSpinner />
              ) : isEditMode ? (
                <>
                  <FaEdit /> Update Customer
                </>
              ) : (
                <>
                  <FaUserPlus /> Create Customer
                </>
              )}
            </ModalButton>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>

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
              disabled={formLoading}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="mobileNo">
              <FaPhone />
              Mobile Number
            </Label>
            <Input
              type="tel"
              id="mobileNo"
              name="mobileNo"
              value={formData.mobileNo}
              onChange={handleFormChange}
              placeholder="Enter mobile number (e.g., +1234567890)"
              required
              disabled={formLoading}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="address">
              <FaMapMarkerAlt />
              Address
            </Label>
            <Input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleFormChange}
              placeholder="Enter complete address"
              required
              disabled={formLoading}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="reference">
              Reference (Optional)
            </Label>
            <Input
              type="text"
              id="reference"
              name="reference"
              value={formData.reference || ''}
              onChange={handleFormChange}
              placeholder="Enter reference information (optional)"
              disabled={formLoading}
            />
          </FormGroup>
        </form>
      </Modal>

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
              disabled={formLoading}
              style={{ background: '#dc3545', marginTop: 0 }}
            >
              {formLoading ? <LoadingSpinner /> : 'Delete'}
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
