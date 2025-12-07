import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  Chip,
  CircularProgress,
} from '@mui/material';
import MUICustomBtn from '../../Components/Common/MUICustomBtn';
import {
  ShoppingCart as ShoppingCartIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
} from '@mui/icons-material';
import {
  getBookedOrdersService,
  type ProductOrder,
} from '../../Services/ApiServices/productOrderServices';
import { useToast } from '../../Utils/ToastContext';
import { useTranslation } from '../../hooks/useTranslation';
import DataTable, { type Column } from '../../Components/Common/DataTable';
import DataCardGrid, { type CardField, type CardAction } from '../../Components/Common/DataCardGrid';
import type { PaginationMeta } from '../../Services/ApiServices';

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
  const [filteredOrders, setFilteredOrders] = useState<ProductOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [currentPage, setCurrentPage] = useState(0); // 0-based for MUI TablePagination
  const [pageSize, setPageSize] = useState(10);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);

  const fetchOrders = useCallback(async (page: number = 0) => {
    try {
      setLoading(true);
      const apiPage = page + 1; // Convert 0-based to 1-based for API
      const response = await getBookedOrdersService(apiPage, pageSize);
      if (response.success === 200 && response.data) {
        const { orders: ordersData, pagination } = response.data;
        setOrders(ordersData);
        setPaginationMeta(pagination);
        setCurrentPage(page);
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
  }, [showError, pageSize]);

  useEffect(() => {
    fetchOrders(currentPage);
  }, [fetchOrders, currentPage]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredOrders(orders);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = orders.filter(
      (order) =>
        order.id.toLowerCase().includes(term) ||
        (order.customerName && order.customerName.toLowerCase().includes(term)) ||
        order.status.toLowerCase().includes(term)
    );
    setFilteredOrders(filtered);
  }, [searchTerm, orders]);

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

  // Table columns configuration
  const columns: Column<ProductOrder>[] = [
    {
      id: 'orderId',
      label: t('orders.orderId'),
      render: (order) => order.id.substring(0, 8) + '...',
    },
    {
      id: 'customer',
      label: t('orders.customer'),
      render: (order) => order.customerName || '—',
    },
    {
      id: 'orderDate',
      label: t('orders.orderDate'),
      render: (order) => formatDate(order.orderDate),
    },
    {
      id: 'deliveryDate',
      label: t('orders.deliveryDate'),
      render: (order) => formatDate(order.deliveryDate),
    },
    {
      id: 'status',
      label: t('orders.status'),
      render: (order) => (
        <Chip
          label={order.status}
          color={getStatusColor(order.status)}
          size="small"
          sx={{ fontWeight: 600, textTransform: 'uppercase' }}
        />
      ),
    },
    {
      id: 'totalAmount',
      label: t('orders.totalAmount'),
      render: (order) => order.totalAmount ? `$${order.totalAmount.toFixed(2)}` : '—',
    },
    {
      id: 'actions',
      label: t('common.actions'),
      render: (order) => (
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
      ),
    },
  ];

  // Card fields configuration
  const cardFields: CardField<ProductOrder>[] = [
    {
      id: 'customer',
      label: t('orders.customer'),
      render: (order) => <Typography variant="body2">{order.customerName || '—'}</Typography>,
    },
    {
      id: 'orderDate',
      label: t('orders.orderDate'),
      render: (order) => (
        <Typography variant="body2" color="text.secondary">
          {formatDate(order.orderDate)}
        </Typography>
      ),
    },
    {
      id: 'deliveryDate',
      label: t('orders.deliveryDate'),
      render: (order) => (
        <Typography variant="body2" color="text.secondary">
          {formatDate(order.deliveryDate)}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: t('orders.status'),
      render: (order) => (
        <Chip
          label={order.status}
          color={getStatusColor(order.status)}
          size="small"
          sx={{ fontWeight: 600, textTransform: 'uppercase' }}
        />
      ),
    },
    {
      id: 'totalAmount',
      label: t('orders.totalAmount'),
      render: (order) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {order.totalAmount ? `$${order.totalAmount.toFixed(2)}` : '—'}
        </Typography>
      ),
    },
  ];

  // Card actions configuration
  const cardActions: CardAction<ProductOrder>[] = [
    {
      id: 'view',
      render: (order) => (
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
          <VisibilityIcon fontSize="small" />
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
          {t('orders.title')}
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
              borderColor: showFilter ? '#667eea' : '#ccc',
              color: showFilter ? '#667eea' : '#666',
              '&:hover': {
                borderColor: '#667eea',
                bgcolor: 'rgba(102, 126, 234, 0.04)',
                transform: 'translateY(-2px)',
              },
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              px: 2,
              py: 1,
              borderRadius: 1.5,
            }}
          >
            {showFilter ? 'Hide Filter' : 'Show Filter'}
          </Button>
          <Button
            variant="outlined"
            startIcon={viewMode === 'table' ? <ViewModuleIcon /> : <ViewListIcon />}
            onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}
            sx={{
              borderColor: '#ccc',
              color: '#666',
              '&:hover': {
                borderColor: '#667eea',
                bgcolor: 'rgba(102, 126, 234, 0.04)',
                transform: 'translateY(-2px)',
              },
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              px: 2,
              py: 1,
              borderRadius: 1.5,
              display: { xs: 'none', lg: 'flex' },
            }}
          >
            {viewMode === 'table' ? 'Card View' : 'Table View'}
          </Button>
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
              fontSize: '0.875rem',
              px: 2.5,
              py: 1,
              borderRadius: 1.5,
              whiteSpace: 'nowrap',
              minWidth: { xs: 'auto', sm: 140 },
            }}
          >
            {t('orders.bookNewOrder')}
          </Button>
        </Box>
      </Box>

      {showFilter && (
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search orders by order ID, customer name, or status..."
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
      ) : filteredOrders.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <ShoppingCartIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
          <Typography variant="body1">
            {searchTerm ? 'No orders found matching your search' : t('orders.noOrders')}
          </Typography>
        </Box>
      ) : (
        <>
          {/* Desktop view - show table or card based on viewMode */}
          <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
            {viewMode === 'table' ? (
              <DataTable
                columns={columns}
                data={filteredOrders}
                getRowKey={(order) => order.id}
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
                data={filteredOrders}
                getCardTitle={(order) => `Order ${order.id.substring(0, 8)}...`}
                getCardSubtitle={(order) => order.customerName || 'No customer name'}
                fields={cardFields}
                actions={cardActions}
                getRowKey={(order) => order.id}
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
              data={filteredOrders}
              getCardTitle={(order) => `Order ${order.id.substring(0, 8)}...`}
              getCardSubtitle={(order) => order.customerName || 'No customer name'}
              fields={cardFields}
              actions={cardActions}
              getRowKey={(order) => order.id}
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
    </Card>
  );
};

export default OrdersPage;
