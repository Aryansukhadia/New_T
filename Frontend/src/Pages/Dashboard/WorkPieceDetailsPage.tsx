import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useTranslation } from '../../hooks/useTranslation';
import {
  getWorkpieceMeasurementsService,
  type WorkpieceMeasurements,
} from '../../Services/ApiServices/productOrderServices';
import { useToast } from '../../Utils/ToastContext';
import { LoadingSpinner } from '../../Components/Common/FormComponents';
import {
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBox,
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
  const { showError } = useToast();
  const { t } = useTranslation();

  const [measurements, setMeasurements] = useState<WorkpieceMeasurements | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWorkpieceDetails = useCallback(async () => {
    if (!workpieceId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Automatically call the measurements API when page opens
      const response = await getWorkpieceMeasurementsService(workpieceId);

      if (response.success === 200 && response.data) {
        // Set the measurements data when API call succeeds
        setMeasurements(response.data);
      } else {
        showError(response.message || 'Failed to load work piece details', 'Error');
        setMeasurements(null);
      }
    } catch (err: unknown) {
      console.error('Error fetching work piece details:', err);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        showError(axiosError.response?.data?.message || 'Failed to load work piece details', 'Error');
      } else {
        showError('Failed to load work piece details. Please try again.', 'Error');
      }
      setMeasurements(null);
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

  if (!measurements) {
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
        <PageTitle>{t('orders.workpieceDetails')} - {measurements.workpiece.productItem.name}</PageTitle>
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
          {measurements.workpiece.productItem.imageUrl && (
            <WorkPieceImage
              src={measurements.workpiece.productItem.imageUrl}
              alt={measurements.workpiece.productItem.name}
            />
          )}
          <InfoItem>
            <InfoLabel>{t('orders.product')}</InfoLabel>
            <InfoValue>{measurements.workpiece.productItem.name}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>{t('orders.status')}</InfoLabel>
            <InfoValue>
              <StatusBadge status={measurements.workpiece.currentStatus}>
                {t(`status.${measurements.workpiece.currentStatus.toLowerCase()}`) || measurements.workpiece.currentStatus}
              </StatusBadge>
            </InfoValue>
          </InfoItem>
          {measurements.workpiece.remarks && (
            <InfoItem>
              <InfoLabel>{t('orders.remarks')}</InfoLabel>
              <InfoValue>{measurements.workpiece.remarks}</InfoValue>
            </InfoItem>
          )}
          <InfoItem>
            <InfoLabel>{t('orders.createdAt')}</InfoLabel>
            <InfoValue>{formatDate(measurements.workpiece.createdAt)}</InfoValue>
          </InfoItem>
        </InfoCard>

        {/* Customer Information */}
        <InfoCard>
          <CardTitle>
            <FaUser /> {t('orders.customerInfo')}
          </CardTitle>
          <InfoItem>
            <InfoLabel>{t('customers.fullName')}</InfoLabel>
            <InfoValue>{measurements.customer.fullName}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>
              <FaEnvelope style={{ marginRight: '4px' }} />
              {t('customers.email')}
            </InfoLabel>
            <InfoValue>{measurements.customer.emailId}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>
              <FaPhone style={{ marginRight: '4px' }} />
              {t('customers.mobile')}
            </InfoLabel>
            <InfoValue>{measurements.customer.mobileNo}</InfoValue>
          </InfoItem>
        </InfoCard>
      </ContentGrid>
    </PageContainer>
  );
};

export default WorkPieceDetailsPage;

