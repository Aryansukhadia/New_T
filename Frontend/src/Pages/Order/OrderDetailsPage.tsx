import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  Button,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  ArrowBack as ArrowBackIcon,
  Straighten as StraightenIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useTranslation } from '../../hooks/useTranslation';
import {
  getOrderDetailsService,
  getWorkpieceMeasurementsService,
  type ProductOrderDetails,
  type WorkpieceMeasurements,
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

const OrderDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showError } = useToast();
  const { t } = useTranslation();

  const [order, setOrder] = useState<ProductOrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMeasurementsModalOpen, setIsMeasurementsModalOpen] = useState(false);
  const [measurements, setMeasurements] = useState<WorkpieceMeasurements | null>(null);
  const [loadingMeasurements, setLoadingMeasurements] = useState(false);

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

  const handleViewMeasurements = async (workpieceId: string) => {
    try {
      setLoadingMeasurements(true);
      const response = await getWorkpieceMeasurementsService(workpieceId);
      if (response.success === 200 && response.data) {
        setMeasurements(response.data);
        setIsMeasurementsModalOpen(true);
      } else {
        showError(response.message || 'Failed to load measurements', 'Error');
      }
    } catch (err: unknown) {
      console.error('Error fetching measurements:', err);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        showError(axiosError.response?.data?.message || 'Failed to load measurements', 'Error');
      } else {
        showError('Failed to load measurements. Please try again.', 'Error');
      }
    } finally {
      setLoadingMeasurements(false);
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
        <Grid xs={12} sm={6} md={4}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
            {t('orders.customer')}
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {order.customerName || '—'}
          </Typography>
        </Grid>
        <Grid xs={12} sm={6} md={4}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
            {t('orders.orderDate')}
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {formatDate(order.orderDate)}
          </Typography>
        </Grid>
        <Grid xs={12} sm={6} md={4}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
            {t('orders.deliveryDate')}
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {formatDate(order.deliveryDate)}
          </Typography>
        </Grid>
        <Grid xs={12} sm={6} md={4}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
            {t('orders.status')}
          </Typography>
          <Chip
            label={t(`status.${order.status.toLowerCase()}`) || order.status}
            color={getStatusColor(order.status)}
            size="small"
            sx={{ fontWeight: 600, textTransform: 'uppercase' }}
          />
        </Grid>
        {order.notes && (
          <Grid xs={12}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
              {t('orders.notes')}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {order.notes}
            </Typography>
          </Grid>
        )}
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {t('orders.workPieces')} ({order.workPieces.length})
        </Typography>
      </Box>

      {order.workPieces.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <Typography variant="body1">
            {t('orders.workPieces')} {t('common.noData')}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {order.workPieces.map((workPiece) => (
            <Grid xs={12} sm={6} md={4} key={workPiece.id}>
              <Card sx={{ p: 2, bgcolor: '#f8f9fa', border: '2px solid #e0e0e0', transition: 'all 0.2s ease', '&:hover': { borderColor: '#667eea', boxShadow: '0 4px 8px rgba(102, 126, 234, 0.2)' } }}>
                {workPiece.productItem.imageUrl && (
                  <Box
                    component="img"
                    src={workPiece.productItem.imageUrl}
                    alt={workPiece.productItem.name}
                    sx={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 1, mb: 1.5 }}
                  />
                )}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="h6" sx={{ fontSize: 16 }}>
                    {workPiece.productItem.name}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: 12, color: 'text.secondary' }}>
                    {t('orders.status')}: <Chip label={t(`status.${workPiece.currentStatus.toLowerCase()}`) || workPiece.currentStatus} color={getStatusColor(workPiece.currentStatus)} size="small" sx={{ fontWeight: 600 }} />
                  </Typography>
                  {workPiece.assignedTo && (
                    <Typography variant="caption" sx={{ fontSize: 12, color: 'text.secondary' }}>
                      {t('orders.assignedTo') || 'Assigned to'}: {workPiece.assignedTo.fullName}
                    </Typography>
                  )}
                  {workPiece.remarks && (
                    <Typography variant="caption" sx={{ fontSize: 12, color: 'text.secondary' }}>
                      {t('orders.remarks') || 'Remarks'}: {workPiece.remarks}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1.5 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<VisibilityIcon />}
                      onClick={() => navigate(`/dashboard/workpiece/${workPiece.id}`)}
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
                      {t('orders.viewDetails')}
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<StraightenIcon />}
                      onClick={() => handleViewMeasurements(workPiece.id)}
                      disabled={loadingMeasurements}
                      sx={{
                        borderColor: '#ffe0b2',
                        color: '#f57c00',
                        bgcolor: '#fff3e0',
                        '&:hover': {
                          borderColor: '#f57c00',
                          bgcolor: '#ffe0b2',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 8px rgba(245, 124, 0, 0.2)',
                        },
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    >
                      {t('orders.viewMeasurements')}
                    </Button>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Measurements Dialog */}
      <Dialog open={isMeasurementsModalOpen} onClose={() => setIsMeasurementsModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{t('orders.viewMeasurements')}</DialogTitle>
        <DialogContent>
          {measurements && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 1.5 }}>{t('orders.customerInfo')}</Typography>
                <Typography variant="body2"><strong>{t('customers.fullName')}:</strong> {measurements.customer.fullName}</Typography>
                <Typography variant="body2"><strong>{t('customers.email')}:</strong> {measurements.customer.emailId}</Typography>
                <Typography variant="body2"><strong>{t('customers.mobile')}:</strong> {measurements.customer.mobileNo}</Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 1.5 }}>{t('orders.workpieceInfo')}</Typography>
                <Typography variant="body2"><strong>{t('orders.product')}:</strong> {measurements.workpiece.productItem.name}</Typography>
                <Typography variant="body2">
                  <strong>{t('orders.status')}:</strong> <Chip label={t(`status.${measurements.workpiece.currentStatus.toLowerCase()}`) || measurements.workpiece.currentStatus} color={getStatusColor(measurements.workpiece.currentStatus)} size="small" sx={{ fontWeight: 600 }} />
                </Typography>
              </Box>

              <Grid container spacing={1.5} sx={{ mt: 2 }}>
                {measurements.measurements.top && (
                  <Grid xs={12} md={6}>
                    <Card sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                      <Typography variant="h6" sx={{ mb: 1.5, pb: 1, borderBottom: '2px solid #e0e0e0' }}>
                        {t('orders.topMeasurements')}
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid #e0e0e0' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>{t('orders.length')}:</Typography>
                          <Typography variant="body2">{measurements.measurements.top.length ?? '—'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid #e0e0e0' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>{t('orders.shoulder')}:</Typography>
                          <Typography variant="body2">{measurements.measurements.top.shoulder ?? '—'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid #e0e0e0' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>{t('orders.sleeveLength')}:</Typography>
                          <Typography variant="body2">{measurements.measurements.top.sleeveLength ?? '—'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid #e0e0e0' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>{t('orders.sleeveBottom')}:</Typography>
                          <Typography variant="body2">{measurements.measurements.top.sleeveBottom ?? '—'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid #e0e0e0' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>{t('orders.chest')}:</Typography>
                          <Typography variant="body2">{measurements.measurements.top.chest ?? '—'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid #e0e0e0' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>{t('orders.waist')}:</Typography>
                          <Typography variant="body2">{measurements.measurements.top.waist ?? '—'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid #e0e0e0' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>{t('orders.hip')}:</Typography>
                          <Typography variant="body2">{measurements.measurements.top.hip ?? '—'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>{t('orders.neck')}:</Typography>
                          <Typography variant="body2">{measurements.measurements.top.neck ?? '—'}</Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                )}

                {measurements.measurements.bottom && (
                  <Grid xs={12} md={6}>
                    <Card sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                      <Typography variant="h6" sx={{ mb: 1.5, pb: 1, borderBottom: '2px solid #e0e0e0' }}>
                        {t('orders.bottomMeasurements')}
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid #e0e0e0' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>{t('orders.length')}:</Typography>
                          <Typography variant="body2">{measurements.measurements.bottom.length ?? '—'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid #e0e0e0' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>{t('orders.waist')}:</Typography>
                          <Typography variant="body2">{measurements.measurements.bottom.waist ?? '—'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid #e0e0e0' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>{t('orders.hip')}:</Typography>
                          <Typography variant="body2">{measurements.measurements.bottom.hip ?? '—'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid #e0e0e0' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>{t('orders.thigh')}:</Typography>
                          <Typography variant="body2">{measurements.measurements.bottom.thigh ?? '—'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid #e0e0e0' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>{t('orders.knee')}:</Typography>
                          <Typography variant="body2">{measurements.measurements.bottom.knee ?? '—'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid #e0e0e0' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>{t('orders.calf')}:</Typography>
                          <Typography variant="body2">{measurements.measurements.bottom.calf ?? '—'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid #e0e0e0' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>{t('orders.bottom')}:</Typography>
                          <Typography variant="body2">{measurements.measurements.bottom.bottom ?? '—'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>{t('orders.langot')}:</Typography>
                          <Typography variant="body2">{measurements.measurements.bottom.langot ?? '—'}</Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                )}
              </Grid>

              {!measurements.measurements.top && !measurements.measurements.bottom && (
                <Box sx={{ textAlign: 'center', py: 2.5, color: 'text.secondary' }}>
                  <Typography variant="body1">{t('orders.viewMeasurements')} {t('common.noData')}</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsMeasurementsModalOpen(false)} variant="outlined" sx={{ textTransform: 'none', fontWeight: 600 }}>
            {t('common.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default OrderDetailsPage;

