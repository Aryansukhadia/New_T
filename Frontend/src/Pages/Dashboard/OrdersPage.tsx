import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  getBookedOrdersService,
  type ProductOrder,
} from '../../Services/ApiServices/productOrderServices';
import { useToast } from '../../Utils/ToastContext';
import { LoadingSpinner } from '../../Components/Common/FormComponents';
import { useTranslation } from '../../hooks/useTranslation';
import {
  FaShoppingCart,
  FaPlus,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
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
  display: flex;
  align-items: center;
  gap: 8px;

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

const IconButton = styled.button<{ variant?: 'view' }>`
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
    if (props.variant === 'view') {
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

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const PaginationInfo = styled.div`
  font-size: 14px;
  color: #666;
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const PaginationButton = styled.button<{ active?: boolean }>`
  padding: 8px 16px;
  border: 2px solid ${(props) => (props.active ? '#667eea' : '#e0e0e0')};
  background: ${(props) => (props.active ? '#667eea' : 'white')};
  color: ${(props) => (props.active ? 'white' : '#333')};
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: #667eea;
    background: ${(props) => (props.active ? '#667eea' : '#f0f0ff')};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${(props) => {
    switch (props.status.toLowerCase()) {
      case 'pending':
        return '#fff3e0';
      case 'in_progress':
        return '#e3f2fd';
      case 'completed':
        return '#e8f5e9';
      case 'cancelled':
        return '#ffebee';
      default:
        return '#f5f5f5';
    }
  }};
  color: ${(props) => {
    switch (props.status.toLowerCase()) {
      case 'pending':
        return '#f57c00';
      case 'in_progress':
        return '#1976d2';
      case 'completed':
        return '#388e3c';
      case 'cancelled':
        return '#d32f2f';
      default:
        return '#666';
    }
  }};
`;

const OrdersPage = () => {
  const navigate = useNavigate();
  const { showError } = useToast();
  const { t } = useTranslation();

  const [orders, setOrders] = useState<ProductOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit] = useState(10);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getBookedOrdersService(currentPage, limit);
      if (response.success === 200 && response.data) {
        setOrders(response.data.orders);
        setTotalPages(response.data.pagination.totalPages);
        setTotalCount(response.data.pagination.totalCount);
      } else {
        showError(response.message || 'Failed to load orders', 'Error');
      }
    } catch (err: unknown) {
      console.error('Error fetching orders:', err);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        showError(axiosError.response?.data?.message || 'Failed to load orders', 'Error');
      } else {
        showError('Failed to load orders. Please try again.', 'Error');
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, showError]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleBookOrder = () => {
    navigate('/dashboard/orders/book');
  };

  const handleViewOrderDetails = (orderId: string) => {
    navigate(`/dashboard/orders/${orderId}`);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>{t('orders.title')}</PageTitle>
        <ActionButton onClick={handleBookOrder}>
          <FaPlus /> {t('orders.bookNewOrder')}
        </ActionButton>
      </PageHeader>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <LoadingSpinner />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState>
          <EmptyStateIcon>
            <FaShoppingCart />
          </EmptyStateIcon>
          <EmptyStateText>{t('orders.noOrders')}</EmptyStateText>
        </EmptyState>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow isHeader>
                  <TableHeaderCell>{t('orders.orderId')}</TableHeaderCell>
                  <TableHeaderCell>{t('orders.customer')}</TableHeaderCell>
                  <TableHeaderCell>{t('orders.orderDate')}</TableHeaderCell>
                  <TableHeaderCell>{t('orders.deliveryDate')}</TableHeaderCell>
                  <TableHeaderCell>{t('orders.status')}</TableHeaderCell>
                  <TableHeaderCell>{t('orders.totalAmount')}</TableHeaderCell>
                  <TableHeaderCell>{t('common.actions')}</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <tbody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id.substring(0, 8)}...</TableCell>
                    <TableCell>{order.customerName || '—'}</TableCell>
                    <TableCell>{formatDate(order.orderDate)}</TableCell>
                    <TableCell>{formatDate(order.deliveryDate)}</TableCell>
                    <TableCell>
                      <StatusBadge status={order.status}>{order.status}</StatusBadge>
                    </TableCell>
                    <TableCell>{order.totalAmount ? `$${order.totalAmount.toFixed(2)}` : '—'}</TableCell>
                    <ActionCell>
                      <IconButton
                        variant="view"
                        onClick={() => handleViewOrderDetails(order.id)}
                        title={t('orders.viewDetails')}
                      >
                        <FaEye />
                      </IconButton>
                    </ActionCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </TableContainer>

          <PaginationContainer>
            <PaginationInfo>
              {t('pagination.showing')} {((currentPage - 1) * limit) + 1} {t('pagination.to')} {Math.min(currentPage * limit, totalCount)} {t('pagination.of')} {totalCount} {t('orders.title').toLowerCase()}
            </PaginationInfo>
            <PaginationButtons>
              <PaginationButton
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <FaChevronLeft /> {t('pagination.previous')}
              </PaginationButton>
              <PaginationButton
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                {t('pagination.next')} <FaChevronRight />
              </PaginationButton>
            </PaginationButtons>
          </PaginationContainer>
        </>
      )}
    </PageContainer>
  );
};

export default OrdersPage;
