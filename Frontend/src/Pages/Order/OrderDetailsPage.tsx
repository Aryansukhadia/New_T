import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  Button,
  CircularProgress,
  Chip,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  ArrowBack as ArrowBackIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import { useTranslation } from '../../hooks/useTranslation';
import {
  getOrderDetailsService,
  type ProductOrderDetails,
} from '../../Services/ApiServices/productOrderServices';
import { useToast } from '../../Utils/ToastContext';

const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
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

const parseImages = (imageUrl: string | null): string[] => {
  if (!imageUrl) return [];
  try {
    const parsed = JSON.parse(imageUrl);
    return Array.isArray(parsed) ? parsed : [imageUrl];
  } catch {
    return [imageUrl];
  }
};

const OrderDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showError } = useToast();
  const { t } = useTranslation();

  const [order, setOrder] = useState<ProductOrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const fetchOrderDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await getOrderDetailsService(id);
      if (response.success === 200 && response.data) {
        setOrder(response.data);
      } else {
        showError(response.message || 'Failed to load order details', 'Error');
      }
    } catch (err: unknown) {
      console.error('Error fetching order details:', err);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        showError(axiosError.response?.data?.message || 'Failed to load order details', 'Error');
      } else {
        showError('Failed to load order details. Please try again.', 'Error');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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

  if (!order) {
    return (
      <Card sx={{ borderRadius: 1.5, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Order Details
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/dashboard/orders')}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Back to Orders
          </Button>
        </Box>
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <Typography variant="body1">
            {t('orders.orderDetails')} {t('common.noData')}
          </Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 1.5, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {t('orders.orderDetails')} - {order.id.substring(0, 8)}...
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard/orders')}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          {t('common.back')} {t('orders.title')}
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ p: 2.5, bgcolor: '#f8f9fa', borderRadius: 1, mb: 3 }}>
        <Box sx={{ xs: 12, sm: 6, md: 4 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
            {t('orders.customer')}
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {order.customerName || '—'}
          </Typography>
        </Box>
        <Box sx={{ xs: 12, sm: 6, md: 4 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
            {t('orders.orderDate')}
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {formatDate(order.orderDate)}
          </Typography>
        </Box>
        <Box sx={{ xs: 12, sm: 6, md: 4 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
            {t('orders.deliveryDate')}
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {formatDate(order.deliveryDate)}
          </Typography>
        </Box>
        <Box sx={{ xs: 12, sm: 6, md: 4 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
            {t('orders.status')}
          </Typography>
          <Chip
            label={t(`status.${order.status.toLowerCase()}`) || order.status}
            color={getStatusColor(order.status)}
            size="small"
            sx={{ fontWeight: 600, textTransform: 'uppercase' }}
          />
        </Box>
        {order.notes && (
          <Box sx={{ xs: 12 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
              {t('orders.notes')}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {order.notes}
            </Typography>
          </Box>
        )}
      </Grid>

      {/* Order Items Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {t('orders.orderItems')} ({order.orderItems?.length || 0})
        </Typography>
      </Box>

      {!order.orderItems || order.orderItems.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary', bgcolor: '#f8f9fa', borderRadius: 1, mb: 3 }}>
          <Typography variant="body1">
            {t('orders.orderItems')} {t('common.noData')}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {order.orderItems.map((item) => (
            <Box sx={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
              <Card
                sx={{
                  p: 2,
                  bgcolor: item.itemType === 'readyMade' ? '#e8f5e9' : '#e3f2fd',
                  border: '2px solid',
                  borderColor: item.itemType === 'readyMade' ? '#4caf50' : '#2196f3',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: item.itemType === 'readyMade' ? '#2e7d32' : '#1565c0',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
                  }
                }}
              >
                {/* Item Type Badge */}
                <Chip
                  label={item.itemType === 'readyMade' ? 'Ready-Made' : 'Custom Tailored'}
                  color={item.itemType === 'readyMade' ? 'success' : 'primary'}
                  size="small"
                  sx={{ fontWeight: 600, mb: 1.5 }}
                />

                {/* Item Image */}
                {(() => {
                  const imageUrl = item.itemType === 'custom'
                    ? item.productVariant?.imageUrl
                    : (item.readyMadeInventory?.readyMade?.imageUrl ? parseImages(item.readyMadeInventory.readyMade.imageUrl)[0] : null);
                  const altText = item.itemType === 'custom' ? item.productVariant?.name : item.readyMadeInventory?.name;

                  return imageUrl ? (
                    <Box
                      component="img"
                      src={imageUrl}
                      alt={altText || 'Item image'}
                      sx={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 1, mb: 1.5 }}
                    />
                  ) : null;
                })()}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {/* Item Name */}
                  {item.itemType === 'custom' && item.productVariant ? (
                    <>
                      <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 600 }}>
                        {item.productVariant.product.name}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: 14, color: 'text.secondary' }}>
                        Variant: {item.productVariant.name}
                      </Typography>
                      {/* Quantity */}
                      <Typography variant="body1" sx={{ fontSize: 14, fontWeight: 700, color: '#333', mt: 1 }}>
                        Quantity: {item.quantity}
                      </Typography>
                      {/* Notes if any */}
                      {item.notes && (
                        <Typography variant="caption" sx={{ fontSize: 12, color: 'text.secondary', fontStyle: 'italic', mt: 0.5 }}>
                          Note: {item.notes}
                        </Typography>
                      )}
                      {/* View Work Pieces Button */}
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<BuildIcon />}
                        onClick={() => navigate(`/dashboard/orders/${id}/items/${item.id}/workpieces`)}
                        sx={{
                          mt: 2,
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
                        View Work Pieces
                      </Button>
                    </>
                  ) : item.itemType === 'readyMade' && item.readyMadeInventory ? (
                    <>
                      <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 600 }}>
                        {item.readyMadeInventory.name}
                      </Typography>
                      {item.readyMadeInventory.readyMade && (
                        <>
                          <Typography variant="body2" sx={{ fontSize: 14, color: 'text.secondary' }}>
                            Color: {item.readyMadeInventory.readyMade.color}
                          </Typography>
                          {(item.readyMadeInventory.readyMade.sizeLabel || item.readyMadeInventory.readyMade.sizeNumber) && (
                            <Typography variant="body2" sx={{ fontSize: 14, color: 'text.secondary' }}>
                              Size: {item.readyMadeInventory.readyMade.sizeLabel || item.readyMadeInventory.readyMade.sizeNumber}
                            </Typography>
                          )}
                          <Typography variant="body2" sx={{ fontSize: 14, color: 'text.secondary', fontWeight: 600 }}>
                            Price: ₹{Number(item.readyMadeInventory.readyMade.price).toFixed(2)}
                          </Typography>
                        </>
                      )}
                      {/* Quantity */}
                      <Typography variant="body1" sx={{ fontSize: 14, fontWeight: 700, color: '#333', mt: 1 }}>
                        Quantity: {item.quantity}
                      </Typography>
                      {/* Notes if any */}
                      {item.notes && (
                        <Typography variant="caption" sx={{ fontSize: 12, color: 'text.secondary', fontStyle: 'italic', mt: 0.5 }}>
                          Note: {item.notes}
                        </Typography>
                      )}
                    </>
                  ) : null}
                </Box>
              </Card>
            </Box>
          ))}
        </Grid>
      )}
    </Card>
  );
};

export default OrderDetailsPage;

