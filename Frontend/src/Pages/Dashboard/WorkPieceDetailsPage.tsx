import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useTranslation } from '../../hooks/useTranslation';
import { useToast } from '../../Utils/ToastContext';
import { LoadingSpinner } from '../../Components/Common/FormComponents';
import {
  FaArrowLeft,
  FaCut,
  FaBox,
} from 'react-icons/fa';
import { convertWorkPiecePendingToCuttingService, getWorkPieceByIdService, type WorkPieceSummary } from '../../Services/ApiServices/workPieceServices';

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

const BackButton = styled.button`
  padding: 12px 24px;
  background: #f5f5f5;
  color: #333;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: #e8e8e8;
    border-color: #ccc;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const ConvertStatusButton = styled.button`
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
  margin-bottom: 16px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
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
      case 'cutting':
        return '#e3f2fd';
      case 'redaytostich':
      case 'ready_to_stich':
        return '#f3e5f5';
      case 'stitching':
        return '#e1f5fe';
      case 'readytofinishing':
      case 'ready_to_finishing':
        return '#fff9c4';
      case 'finishing':
        return '#fce4ec';
      case 'readytodeliver':
      case 'ready_to_deliver':
        return '#e8f5e9';
      case 'in_progress':
        return '#e3f2fd';
      case 'completed':
        return '#e8f5e9';
      default:
        return '#f5f5f5';
    }
  }};
  color: ${(props) => {
    switch (props.status.toLowerCase()) {
      case 'pending':
        return '#f57c00';
      case 'cutting':
        return '#1976d2';
      case 'redaytostich':
      case 'ready_to_stich':
        return '#7b1fa2';
      case 'stitching':
        return '#0277bd';
      case 'readytofinishing':
      case 'ready_to_finishing':
        return '#f57f17';
      case 'finishing':
        return '#c2185b';
      case 'readytodeliver':
      case 'ready_to_deliver':
        return '#388e3c';
      case 'in_progress':
        return '#1976d2';
      case 'completed':
        return '#388e3c';
      default:
        return '#666';
    }
  }};
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const InfoCard = styled.div`
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
`;

const CardTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e0e0e0;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  font-size: 12px;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
`;

const InfoValue = styled.span`
  font-size: 14px;
  color: #333;
  font-weight: 500;
`;

const WorkPieceImage = styled.img`
  width: 100%;
  max-width: 300px;
  height: 300px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 16px;
  border: 2px solid #e0e0e0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
`;

const EmptyStateText = styled.p`
  font-size: 16px;
  margin: 0;
`;

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
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <LoadingSpinner />
        </div>
      </PageContainer>
    );
  }

  if (!summary) {
    return (
      <PageContainer>
        <PageHeader>
          <PageTitle>{t('orders.workpieceDetails')}</PageTitle>
          <BackButton onClick={handleBack}>
            <FaArrowLeft /> {t('common.back')}
          </BackButton>
        </PageHeader>
        <EmptyState>
          <EmptyStateText>{t('orders.workpieceDetails')} {t('common.noData')}</EmptyStateText>
        </EmptyState>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>{t('orders.workpieceDetails')} - {summary.productItem.name}</PageTitle>
        <BackButton onClick={handleBack}>
          <FaArrowLeft /> {t('common.back')}
        </BackButton>
      </PageHeader>

      <ContentGrid>
        {/* Work Piece Information */}
        <InfoCard>
          <CardTitle>
            <FaBox /> {t('orders.workpieceInfo')}
          </CardTitle>
          {summary.productItem.imageUrl && (
            <WorkPieceImage
              src={summary.productItem.imageUrl}
              alt={summary.productItem.name}
            />
          )}
          <InfoItem>
            <InfoLabel>{t('orders.product')}</InfoLabel>
            <InfoValue>{summary.productItem.name}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>{t('orders.status')}</InfoLabel>
            <InfoValue>
              <StatusBadge status={summary.workPieceStage?.stage || 'pending'}>
                {summary.workPieceStage?.stage ? (t(`status.${summary.workPieceStage.stage.toLowerCase()}`) || summary.workPieceStage.stage) : '—'}
              </StatusBadge>
            </InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>{t('orders.orderDate')}</InfoLabel>
            <InfoValue>{formatDate(summary.orderDate)}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>{t('orders.createdAt')}</InfoLabel>
            <InfoValue>{formatDate(summary.productItem.createdAt)}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>{t('orders.lastUpdated') || 'Last Updated'}</InfoLabel>
            <InfoValue>{formatDate(summary.lastUpdated)}</InfoValue>
          </InfoItem>

          {summary.workPieceStage?.stage?.toLowerCase() === 'pending' && (
            <ConvertStatusButton
              onClick={handleConvertPendingToCutting}
              disabled={convertingStatus}
            >
              <FaCut /> {convertingStatus ? t('common.loading') : t('orders.convertPendingToCutting')}
            </ConvertStatusButton>
          )}

        </InfoCard>
      </ContentGrid>
    </PageContainer>
  );
};

export default WorkPieceDetailsPage;

