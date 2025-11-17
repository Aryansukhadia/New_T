import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Paper,
  Chip,
  CircularProgress,
} from '@mui/material';
import MUICustomBtn from '../../Components/Common/MUICustomBtn';
import CustomTablePaginationComponent from '../../Components/Common/CustomTablePagination';
import {
  ShoppingCart as ShoppingCartIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import {
  getBookedOrdersService,
  type ProductOrder,
} from '../../Services/ApiServices/productOrderServices';
import { useToast } from '../../Utils/ToastContext';
import { useTranslation } from '../../hooks/useTranslation';

const getStatusColor = (status: string): 'warning' | 'info' | 'success' | 'error' | 'default' => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'warning';
    case 'in_progress':
      return 'info';
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const OrdersPage = () => {
  const navigate = useNavigate();
  const { showError } = useToast();
  const { t } = useTranslation();

  const [orders, setOrders] = useState<ProductOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0); // 0-based for MUI TablePagination
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const apiPage = currentPage + 1; // Convert 0-based to 1-based for API
      const response = await getBookedOrdersService(apiPage, pageSize);
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
  }, [currentPage, pageSize, showError]);

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
    <Card sx={{ borderRadius: 1.5, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {t('orders.title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleBookOrder}
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
          {t('orders.bookNewOrder')}
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : orders.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <ShoppingCartIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
          <Typography variant="body1">{t('orders.noOrders')}</Typography>
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>{t('orders.orderId')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('orders.customer')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('orders.orderDate')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('orders.deliveryDate')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('orders.status')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('orders.totalAmount')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>{order.id.substring(0, 8)}...</TableCell>
                    <TableCell>{order.customerName || '—'}</TableCell>
                    <TableCell>{formatDate(order.orderDate)}</TableCell>
                    <TableCell>{formatDate(order.deliveryDate)}</TableCell>
                    <TableCell>
                      <Chip
                        label={order.status}
                        color={getStatusColor(order.status)}
                        size="small"
                        sx={{ fontWeight: 600, textTransform: 'uppercase' }}
                      />
                    </TableCell>
                    <TableCell>{order.totalAmount ? `$${order.totalAmount.toFixed(2)}` : '—'}</TableCell>
                    <TableCell>
                      <MUICustomBtn
                        size="small"
                        onClick={() => handleViewOrderDetails(order.id)}
                        tooltip={t('orders.viewDetails')}
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
                        <VisibilityIcon />
                      </MUICustomBtn>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <tfoot>
                <tr>
                  <CustomTablePaginationComponent
                    count={totalCount}
                    page={currentPage}
                    rowsPerPage={pageSize}
                    onPageChange={(_event, page) => setCurrentPage(page)}
                    onRowsPerPageChange={(event) => {
                      const newRowsPerPage = parseInt(event.target.value, 10);
                      const actualRowsPerPage = newRowsPerPage === -1 ? 10000 : newRowsPerPage;
                      setPageSize(actualRowsPerPage);
                      setCurrentPage(0);
                    }}
                  />
                </tr>
              </tfoot>
            </Table>
          </TableContainer>
        </>
      )}
    </Card>
  );
};

export default OrdersPage;
