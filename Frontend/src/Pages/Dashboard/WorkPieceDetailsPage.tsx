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
  ContentCut as ContentCutIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { useTranslation } from '../../hooks/useTranslation';
import { useToast } from '../../Utils/ToastContext';
import { convertWorkPiecePendingToCuttingService, getWorkPieceByIdService, type WorkPieceSummary } from '../../Services/ApiServices/workPieceServices';

const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'warning';
    case 'cutting':
    case 'in_progress':
      return 'info';
    case 'stitching':
      return 'primary';
    case 'readytodeliver':
    case 'ready_to_deliver':
    case 'completed':
      return 'success';
    default:
      return 'default';
  }
};

const WorkPieceDetailsPage = () => {
  const { workpieceId } = useParams<{ workpieceId: string }>();
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const { t } = useTranslation();

  const [summary, setSummary] = useState<WorkPieceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [convertingStatus, setConvertingStatus] = useState(false);

  const fetchWorkpieceDetails = useCallback(async () => {
    if (!workpieceId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getWorkPieceByIdService(workpieceId);

      if (response.success === 200 && response.data) {
        setSummary(response.data);
      } else {
        showError(response.message || 'Failed to load work piece details', 'Error');
        setSummary(null);
      }
    } catch (err: unknown) {
      console.error('Error fetching work piece details:', err);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        showError(axiosError.response?.data?.message || 'Failed to load work piece details', 'Error');
      } else {
        showError('Failed to load work piece details. Please try again.', 'Error');
      }
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [workpieceId, showError]);

  // Automatically fetch measurements when component mounts or workpieceId changes
  useEffect(() => {
    if (workpieceId) {
      fetchWorkpieceDetails();
    }
  }, [workpieceId, fetchWorkpieceDetails]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleConvertPendingToCutting = async () => {
    if (!workpieceId) return;

    try {
      setConvertingStatus(true);
      const response = await convertWorkPiecePendingToCuttingService(workpieceId);
      if (response.success === 200) {
        await fetchWorkpieceDetails();
        showSuccess(response.message || 'Converted to Cutting', 'Success');
      } else {
        showError(response.message || 'Failed to convert', 'Error');
      }
    } catch (err: unknown) {
      console.error('Error converting workpiece to cutting:', err);
      showError('Failed to convert. Please try again.', 'Error');
    } finally {
      setConvertingStatus(false);
    }
  };

  const handleBack = () => {
    // Try to go back to the previous page, or default to orders
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard/orders');
    }
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

  if (!summary) {
    return (
      <Card sx={{ borderRadius: 1.5, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {t('orders.workpieceDetails')}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {t('common.back')}
          </Button>
        </Box>
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <Typography variant="body1">
            {t('orders.workpieceDetails')} {t('common.noData')}
          </Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 1.5, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {t('orders.workpieceDetails')} - {summary.productItem.name}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          {t('common.back')}
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid xs={12} md={6}>
          <Card sx={{ p: 3, bgcolor: '#f8f9fa', border: '2px solid #e0e0e0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1.5, mb: 2, borderBottom: '2px solid #e0e0e0' }}>
              <InventoryIcon />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {t('orders.workpieceInfo')}
              </Typography>
            </Box>

            {summary.productItem.imageUrl && (
              <Box
                component="img"
                src={summary.productItem.imageUrl}
                alt={summary.productItem.name}
                sx={{
                  width: '100%',
                  maxWidth: 300,
                  height: 300,
                  objectFit: 'cover',
                  borderRadius: 1,
                  mb: 2,
                  border: '2px solid #e0e0e0',
                }}
              />
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                  {t('orders.product')}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {summary.productItem.name}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                  {t('orders.status')}
                </Typography>
                <Chip
                  label={summary.workPieceStage?.stage ? (t(`status.${summary.workPieceStage.stage.toLowerCase()}`) || summary.workPieceStage.stage) : '—'}
                  color={getStatusColor(summary.workPieceStage?.stage || 'pending')}
                  size="small"
                  sx={{ fontWeight: 600, textTransform: 'uppercase' }}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                  {t('orders.orderDate')}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {formatDate(summary.orderDate)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                  {t('orders.createdAt')}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {formatDate(summary.productItem.createdAt)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                  {t('orders.lastUpdated') || 'Last Updated'}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {formatDate(summary.lastUpdated)}
                </Typography>
              </Box>
            </Box>

            {summary.workPieceStage?.stage?.toLowerCase() === 'pending' && (
              <Button
                fullWidth
                variant="contained"
                startIcon={<ContentCutIcon />}
                onClick={handleConvertPendingToCutting}
                disabled={convertingStatus}
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
                {convertingStatus ? t('common.loading') : t('orders.convertPendingToCutting')}
              </Button>
            )}
          </Card>
        </Grid>
      </Grid>
    </Card>
  );
};

export default WorkPieceDetailsPage;

