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
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from '@mui/icons-material';
import { useTranslation } from '../../hooks/useTranslation';
import { useToast } from '../../Utils/ToastContext';
import { 
  convertWorkPiecePendingToCuttingService, 
  getWorkPieceByIdService, 
  getWorkPieceStatusHistoryService,
  type WorkPieceSummary,
  type WorkPieceStatusHistory 
} from '../../Services/ApiServices/workPieceServices';
import { formatStatus } from '../../Utils/WorkPiece';

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
  const [history, setHistory] = useState<WorkPieceStatusHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
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

  const fetchWorkpieceHistory = useCallback(async () => {
    if (!workpieceId) {
      return;
    }

    try {
      setHistoryLoading(true);
      const response = await getWorkPieceStatusHistoryService(workpieceId);

      if (response.success === 200 && response.data) {
        setHistory(response.data);
      } else {
        showError(response.message || 'Failed to load work piece history', 'Error');
        setHistory(null);
      }
    } catch (err: unknown) {
      console.error('Error fetching work piece history:', err);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        showError(axiosError.response?.data?.message || 'Failed to load work piece history', 'Error');
      } else {
        showError('Failed to load work piece history. Please try again.', 'Error');
      }
      setHistory(null);
    } finally {
      setHistoryLoading(false);
    }
  }, [workpieceId, showError]);

  // Automatically fetch details and history when component mounts or workpieceId changes
  useEffect(() => {
    if (workpieceId) {
      fetchWorkpieceDetails();
      fetchWorkpieceHistory();
    }
  }, [workpieceId, fetchWorkpieceDetails, fetchWorkpieceHistory]);

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
        await Promise.all([fetchWorkpieceDetails(), fetchWorkpieceHistory()]);
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
          {t('orders.workpieceDetails')} - {summary.productItem.name}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            px: 2,
            py: 1,
          }}
        >
          {t('common.back')}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* WorkPiece Info Section */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 3, bgcolor: '#f8f9fa', border: '2px solid #e0e0e0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1.5, mb: 2, borderBottom: '2px solid #e0e0e0' }}>
              <InventoryIcon />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {t('orders.workpieceInfo')}
              </Typography>
            </Box>

            {/* Image on left, text on right */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              gap: 3,
              alignItems: { xs: 'center', md: 'flex-start' }
            }}>
              {/* Image Section */}
              {summary.productItem.imageUrl && (
                <Box
                  component="img"
                  src={summary.productItem.imageUrl}
                  alt={summary.productItem.name}
                  sx={{
                    width: { xs: '100%', md: 300 },
                    maxWidth: 300,
                    height: 300,
                    objectFit: 'cover',
                    borderRadius: 1,
                    border: '2px solid #e0e0e0',
                    flexShrink: 0,
                  }}
                />
              )}

              {/* Details Section */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 2,
                flex: 1,
                width: '100%'
              }}>
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

                {summary.workPieceStage?.stage?.toLowerCase() === 'pending' && (
                  <Button
                    variant="contained"
                    startIcon={<ContentCutIcon />}
                    onClick={handleConvertPendingToCutting}
                    disabled={convertingStatus}
                    sx={{
                      mt: 1,
                      maxWidth: 300,
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
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Status History Section */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 3, bgcolor: '#f8f9fa', border: '2px solid #e0e0e0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1.5, mb: 2, borderBottom: '2px solid #e0e0e0' }}>
              <HistoryIcon />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Status History
              </Typography>
            </Box>

            {historyLoading ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <CircularProgress size={30} />
              </Box>
            ) : history && history.statusHistory.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Summary Stats */}
                <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                  <Chip 
                    label={`Total: ${history.totalStages}`} 
                    size="small" 
                    sx={{ fontWeight: 600 }}
                  />
                  <Chip 
                    label={`Completed: ${history.completedStages}`} 
                    size="small" 
                    color="success"
                    sx={{ fontWeight: 600 }}
                  />
                  <Chip 
                    label={`Active: ${history.activeStages}`} 
                    size="small" 
                    color="info"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>

                {/* Timeline */}
                <Box sx={{ 
                  position: 'relative', 
                  pl: 3,
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                  gap: 3,
                  alignItems: 'start',
                }}>
                  {history.statusHistory.map((stage, index) => (
                    <Box 
                      key={stage.id}
                      sx={{ 
                        position: 'relative',
                        minHeight: 'fit-content',
                      }}
                    >
                      {/* Timeline Icon */}
                      <Box
                        sx={{
                          position: 'absolute',
                          left: { xs: '-20px', md: '8px' },
                          top: { xs: '4px', md: '-12px' },
                          color: stage.isCompleted ? '#4caf50' : stage.isActive ? '#2196f3' : '#ccc',
                          zIndex: 1,
                        }}
                      >
                        {stage.isCompleted ? (
                          <CheckCircleIcon sx={{ fontSize: 20 }} />
                        ) : (
                          <RadioButtonUncheckedIcon sx={{ fontSize: 20 }} />
                        )}
                      </Box>

                      {/* Stage Content */}
                      <Card 
                        sx={{ 
                          p: 2, 
                          bgcolor: stage.isActive ? 'rgba(33, 150, 243, 0.05)' : 'white',
                          border: stage.isActive ? '2px solid #2196f3' : '1px solid #e0e0e0',
                          display: 'flex',
                          flexDirection: 'column',
                          minHeight: 'fit-content',
                          overflow: 'visible',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Chip
                            label={formatStatus(stage.stage)}
                            color={getStatusColor(stage.stage)}
                            size="small"
                            sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem' }}
                          />
                          {stage.duration !== null && (
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                              {stage.duration}h
                            </Typography>
                          )}
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%' }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', wordBreak: 'break-word' }}>
                            <strong>Started:</strong> {formatDate(stage.startedAt)}
                          </Typography>
                          {stage.completedAt && (
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', wordBreak: 'break-word' }}>
                              <strong>Completed:</strong> {formatDate(stage.completedAt)}
                            </Typography>
                          )}
                          {stage.updatedBy && (
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', wordBreak: 'break-word' }}>
                              <strong>By:</strong> {stage.updatedBy.fullName}
                            </Typography>
                          )}
                          {stage.remarks && (
                            <Typography variant="body2" sx={{ mt: 0.5, fontSize: '0.85rem', fontStyle: 'italic', color: 'text.primary', wordBreak: 'break-word' }}>
                              <strong>Note:</strong> {stage.remarks}
                            </Typography>
                          )}
                        </Box>
                      </Card>
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                <HistoryIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                <Typography variant="body2">
                  No status history available
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </Card>
  );
};

export default WorkPieceDetailsPage;

