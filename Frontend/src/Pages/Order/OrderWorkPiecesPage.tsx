import { useState, useEffect, useCallback } from 'react';
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
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useTranslation } from '../../hooks/useTranslation';
import {
  getOrderItemWorkPiecesService,
  type OrderItemDetail,
  type WorkPiece,
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

const OrderWorkPiecesPage = () => {
  const { id, itemId } = useParams<{ id: string; itemId: string }>();
  const navigate = useNavigate();
  const { showError } = useToast();
  const { t } = useTranslation();

  const [orderItem, setOrderItem] = useState<OrderItemDetail | null>(null);
  const [workPieces, setWorkPieces] = useState<WorkPiece[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkPieces = useCallback(async () => {
    if (!id || !itemId) return;

    try {
      setLoading(true);
      const response = await getOrderItemWorkPiecesService(id, itemId);
      if (response.success === 200 && response.data) {
        setOrderItem(response.data.orderItem);
        setWorkPieces(response.data.workPieces);
      } else {
        showError(response.message || 'Failed to load work pieces', 'Error');
      }
    } catch (err: unknown) {
      console.error('Error fetching work pieces:', err);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        showError(axiosError.response?.data?.message || 'Failed to load work pieces', 'Error');
      } else {
        showError('Failed to load work pieces. Please try again.', 'Error');
      }
    } finally {
      setLoading(false);
    }
  }, [id, itemId, showError]);

  useEffect(() => {
    fetchWorkPieces();
  }, [fetchWorkPieces]);

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
    <Card sx={{ borderRadius: 1.5, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Work Pieces for Order Item
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/dashboard/orders/${id}`)}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          {t('common.back')} to Order Details
        </Button>
      </Box>

      {/* Order Item Section */}
      {orderItem && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Order Item Details
          </Typography>
          <Card
            sx={{
              p: 2,
              bgcolor: '#e3f2fd',
              border: '2px solid #2196f3',
              maxWidth: 400
            }}
          >
            <Chip
              label="Custom Tailored"
              color="primary"
              size="small"
              sx={{ fontWeight: 600, mb: 1.5 }}
            />

            {orderItem.productVariant?.imageUrl && (
              <Box
                component="img"
                src={orderItem.productVariant.imageUrl}
                alt={orderItem.productVariant.name}
                sx={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 1, mb: 1.5 }}
              />
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {orderItem.productVariant && (
                <>
                  <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 600 }}>
                    {orderItem.productVariant.product.name}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: 14, color: 'text.secondary' }}>
                    Variant: {orderItem.productVariant.name}
                  </Typography>
                </>
              )}

              <Typography variant="body1" sx={{ fontSize: 14, fontWeight: 700, color: '#333', mt: 1 }}>
                Quantity: {orderItem.quantity}
              </Typography>

              {orderItem.notes && (
                <Typography variant="caption" sx={{ fontSize: 12, color: 'text.secondary', fontStyle: 'italic', mt: 0.5 }}>
                  Note: {orderItem.notes}
                </Typography>
              )}
            </Box>
          </Card>
        </Box>
      )}

      {/* Work Pieces Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {t('orders.workPieces')} ({workPieces.length})
        </Typography>
      </Box>

      {workPieces.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <Typography variant="body1">
            {t('orders.workPieces')} {t('common.noData')}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {workPieces.map((workPiece) => (
            <Grid xs={12} sm={6} md={4} key={workPiece.id}>
              <Card
                sx={{
                  p: 2,
                  bgcolor: '#f8f9fa',
                  border: '2px solid #e0e0e0',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#667eea',
                    boxShadow: '0 4px 8px rgba(102, 126, 234, 0.2)'
                  }
                }}
              >
                {workPiece.productItem.imageUrl && (
                  <Box
                    component="img"
                    src={workPiece.productItem.imageUrl}
                    alt={workPiece.productItem.name}
                    sx={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 1, mb: 1.5 }}
                  />
                )}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 600 }}>
                    {workPiece.productItem.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 600 }}>
                      {t('orders.status')}:
                    </Typography>
                    <Chip
                      label={t(`status.${workPiece.currentStatus.toLowerCase()}`) || workPiece.currentStatus}
                      color={getStatusColor(workPiece.currentStatus)}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                  {workPiece.assignedTo && (
                    <Typography variant="caption" sx={{ fontSize: 12, color: 'text.secondary' }}>
                      <strong>{t('orders.assignedTo') || 'Assigned to'}:</strong> {workPiece.assignedTo.fullName}
                    </Typography>
                  )}
                  {workPiece.remarks && (
                    <Typography variant="caption" sx={{ fontSize: 12, color: 'text.secondary', fontStyle: 'italic' }}>
                      <strong>{t('orders.remarks') || 'Remarks'}:</strong> {workPiece.remarks}
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
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Card>
  );
};

export default OrderWorkPiecesPage;

