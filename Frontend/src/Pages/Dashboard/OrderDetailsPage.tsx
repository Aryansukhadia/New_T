import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useTranslation } from '../../hooks/useTranslation';
import {
  getOrderDetailsService,
  getWorkpieceMeasurementsService,
  type ProductOrderDetails,
  type WorkpieceMeasurements,
} from '../../Services/ApiServices/productOrderServices';
import { convertPendingToCuttingService } from '../../Services/ApiServices/itemStatusServices';
import Modal from '../../Components/Common/Modal';
import { useToast } from '../../Utils/ToastContext';
import { LoadingSpinner } from '../../Components/Common/FormComponents';
import {
  FaArrowLeft,
  FaRuler,
  FaCut,
  FaEye,
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

const OrderInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
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

const WorkPieceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const WorkPieceCard = styled.div`
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  transition: all 0.2s ease;

  &:hover {
    border-color: #667eea;
    box-shadow: 0 4px 8px rgba(102, 126, 234, 0.2);
  }
`;

const WorkPieceImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 12px;
`;

const WorkPieceInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const WorkPieceTitle = styled.h4`
  margin: 0;
  font-size: 16px;
  color: #333;
`;

const WorkPieceDetail = styled.p`
  margin: 0;
  font-size: 12px;
  color: #666;
`;

const ViewMeasurementsButton = styled.button`
  width: 100%;
  padding: 10px;
  margin-top: 12px;
  background: #fff3e0;
  color: #f57c00;
  border: 2px solid #ffe0b2;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: #ffe0b2;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(245, 124, 0, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ViewDetailsButton = styled.button`
  width: 100%;
  padding: 10px;
  margin-top: 8px;
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
  justify-content: center;
  gap: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
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

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 16px;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const ModalButtonSecondary = styled.button`
  padding: 14px 28px;
  background: #f5f5f5;
  color: #333;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;

  &:hover {
    background: #e8e8e8;
    border-color: #ccc;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
`;

const MeasurementsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 16px;
`;

const MeasurementCard = styled.div`
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const MeasurementTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #333;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 8px;
`;

const MeasurementRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;

  &:last-child {
    border-bottom: none;
  }
`;

const MeasurementLabel = styled.span`
  font-weight: 600;
  color: #666;
`;

const MeasurementValue = styled.span`
  color: #333;
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

const OrderDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const { t } = useTranslation();

  const [order, setOrder] = useState<ProductOrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMeasurementsModalOpen, setIsMeasurementsModalOpen] = useState(false);
  const [measurements, setMeasurements] = useState<WorkpieceMeasurements | null>(null);
  const [loadingMeasurements, setLoadingMeasurements] = useState(false);
  const [convertingStatus, setConvertingStatus] = useState(false);

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

  const handleConvertPendingToCutting = async () => {
    if (!id) return;

    try {
      setConvertingStatus(true);
      const response = await convertPendingToCuttingService();
      if (response.success === 200) {
        // Refresh order details after conversion
        await fetchOrderDetails();
        showSuccess(
          response.message || 'Successfully converted pending items to cutting',
          'Success'
        );
      } else {
        showError(response.message || 'Failed to convert pending items to cutting', 'Error');
      }
    } catch (err: unknown) {
      console.error('Error converting pending to cutting:', err);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        showError(axiosError.response?.data?.message || 'Failed to convert pending items to cutting', 'Error');
      } else {
        showError('Failed to convert pending items to cutting. Please try again.', 'Error');
      }
    } finally {
      setConvertingStatus(false);
    }
  };

  // Check if there are any pending work pieces
  const hasPendingWorkPieces = order?.workPieces.some(wp => wp.currentStatus.toLowerCase() === 'pending') || false;

  if (loading) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <LoadingSpinner />
        </div>
      </PageContainer>
    );
  }

  if (!order) {
    return (
      <PageContainer>
        <PageHeader>
          <PageTitle>Order Details</PageTitle>
          <BackButton onClick={() => navigate('/dashboard/orders')}>
            <FaArrowLeft /> Back to Orders
          </BackButton>
        </PageHeader>
        <EmptyState>
          <EmptyStateText>{t('orders.orderDetails')} {t('common.noData')}</EmptyStateText>
        </EmptyState>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>{t('orders.orderDetails')} - {order.id.substring(0, 8)}...</PageTitle>
        <BackButton onClick={() => navigate('/dashboard/orders')}>
          <FaArrowLeft /> {t('common.back')} {t('orders.title')}
        </BackButton>
      </PageHeader>

      <OrderInfo>
        <InfoItem>
          <InfoLabel>{t('orders.customer')}</InfoLabel>
          <InfoValue>{order.customerName || '—'}</InfoValue>
        </InfoItem>
        <InfoItem>
          <InfoLabel>{t('orders.orderDate')}</InfoLabel>
          <InfoValue>{formatDate(order.orderDate)}</InfoValue>
        </InfoItem>
        <InfoItem>
          <InfoLabel>{t('orders.deliveryDate')}</InfoLabel>
          <InfoValue>{formatDate(order.deliveryDate)}</InfoValue>
        </InfoItem>
        <InfoItem>
          <InfoLabel>{t('orders.status')}</InfoLabel>
          <InfoValue>
            <StatusBadge status={order.status}>{t(`status.${order.status.toLowerCase()}`) || order.status}</StatusBadge>
          </InfoValue>
        </InfoItem>
        {order.notes && (
          <InfoItem>
            <InfoLabel>{t('orders.notes')}</InfoLabel>
            <InfoValue>{order.notes}</InfoValue>
          </InfoItem>
        )}
      </OrderInfo>

      <SectionHeader>
        <SectionTitle>{t('orders.workPieces')} ({order.workPieces.length})</SectionTitle>
        {hasPendingWorkPieces && (
          <ConvertStatusButton
            onClick={handleConvertPendingToCutting}
            disabled={convertingStatus}
          >
            <FaCut /> {convertingStatus ? t('common.loading') : t('orders.convertPendingToCutting')}
          </ConvertStatusButton>
        )}
      </SectionHeader>
      {order.workPieces.length === 0 ? (
        <EmptyState>
          <EmptyStateText>{t('orders.workPieces')} {t('common.noData')}</EmptyStateText>
        </EmptyState>
      ) : (
        <WorkPieceGrid>
          {order.workPieces.map((workPiece) => (
            <WorkPieceCard key={workPiece.id}>
              {workPiece.productItem.imageUrl && (
                <WorkPieceImage src={workPiece.productItem.imageUrl} alt={workPiece.productItem.name} />
              )}
              <WorkPieceInfo>
                <WorkPieceTitle>{workPiece.productItem.name}</WorkPieceTitle>
                <WorkPieceDetail>
                  {t('orders.status')}: <StatusBadge status={workPiece.currentStatus}>{t(`status.${workPiece.currentStatus.toLowerCase()}`) || workPiece.currentStatus}</StatusBadge>
                </WorkPieceDetail>
                {workPiece.assignedTo && (
                  <WorkPieceDetail>{t('orders.assignedTo') || 'Assigned to'}: {workPiece.assignedTo.fullName}</WorkPieceDetail>
                )}
                {workPiece.remarks && (
                  <WorkPieceDetail>{t('orders.remarks') || 'Remarks'}: {workPiece.remarks}</WorkPieceDetail>
                )}
                <ButtonGroup>
                  <ViewDetailsButton
                    onClick={() => navigate(`/dashboard/workpiece/${workPiece.id}`)}
                  >
                    <FaEye /> {t('orders.viewDetails')}
                  </ViewDetailsButton>
                  <ViewMeasurementsButton
                    onClick={() => handleViewMeasurements(workPiece.id)}
                    disabled={loadingMeasurements}
                  >
                    <FaRuler /> {t('orders.viewMeasurements')}
                  </ViewMeasurementsButton>
                </ButtonGroup>
              </WorkPieceInfo>
            </WorkPieceCard>
          ))}
        </WorkPieceGrid>
      )}

      {/* Measurements Modal */}
      <Modal
        isOpen={isMeasurementsModalOpen}
        onClose={() => setIsMeasurementsModalOpen(false)}
        title={t('orders.viewMeasurements')}
        size="large"
        footer={
          <ModalButtonSecondary onClick={() => setIsMeasurementsModalOpen(false)}>{t('common.close')}</ModalButtonSecondary>
        }
      >
        {measurements && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '12px' }}>{t('orders.customerInfo')}</h3>
              <p><strong>{t('customers.fullName')}:</strong> {measurements.customer.fullName}</p>
              <p><strong>{t('customers.email')}:</strong> {measurements.customer.emailId}</p>
              <p><strong>{t('customers.mobile')}:</strong> {measurements.customer.mobileNo}</p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '12px' }}>{t('orders.workpieceInfo')}</h3>
              <p><strong>{t('orders.product')}:</strong> {measurements.workpiece.productItem.name}</p>
              <p><strong>{t('orders.status')}:</strong> <StatusBadge status={measurements.workpiece.currentStatus}>{t(`status.${measurements.workpiece.currentStatus.toLowerCase()}`) || measurements.workpiece.currentStatus}</StatusBadge></p>
            </div>

            <MeasurementsGrid>
              {measurements.measurements.top && (
                <MeasurementCard>
                  <MeasurementTitle>{t('orders.topMeasurements')}</MeasurementTitle>
                  <MeasurementRow>
                    <MeasurementLabel>{t('orders.length')}:</MeasurementLabel>
                    <MeasurementValue>{measurements.measurements.top.length ?? '—'}</MeasurementValue>
                  </MeasurementRow>
                  <MeasurementRow>
                    <MeasurementLabel>{t('orders.shoulder')}:</MeasurementLabel>
                    <MeasurementValue>{measurements.measurements.top.shoulder ?? '—'}</MeasurementValue>
                  </MeasurementRow>
                  <MeasurementRow>
                    <MeasurementLabel>{t('orders.sleeveLength')}:</MeasurementLabel>
                    <MeasurementValue>{measurements.measurements.top.sleeveLength ?? '—'}</MeasurementValue>
                  </MeasurementRow>
                  <MeasurementRow>
                    <MeasurementLabel>{t('orders.sleeveBottom')}:</MeasurementLabel>
                    <MeasurementValue>{measurements.measurements.top.sleeveBottom ?? '—'}</MeasurementValue>
                  </MeasurementRow>
                  <MeasurementRow>
                    <MeasurementLabel>{t('orders.chest')}:</MeasurementLabel>
                    <MeasurementValue>{measurements.measurements.top.chest ?? '—'}</MeasurementValue>
                  </MeasurementRow>
                  <MeasurementRow>
                    <MeasurementLabel>{t('orders.waist')}:</MeasurementLabel>
                    <MeasurementValue>{measurements.measurements.top.waist ?? '—'}</MeasurementValue>
                  </MeasurementRow>
                  <MeasurementRow>
                    <MeasurementLabel>{t('orders.hip')}:</MeasurementLabel>
                    <MeasurementValue>{measurements.measurements.top.hip ?? '—'}</MeasurementValue>
                  </MeasurementRow>
                  <MeasurementRow>
                    <MeasurementLabel>{t('orders.neck')}:</MeasurementLabel>
                    <MeasurementValue>{measurements.measurements.top.neck ?? '—'}</MeasurementValue>
                  </MeasurementRow>
                </MeasurementCard>
              )}

              {measurements.measurements.bottom && (
                <MeasurementCard>
                  <MeasurementTitle>{t('orders.bottomMeasurements')}</MeasurementTitle>
                  <MeasurementRow>
                    <MeasurementLabel>{t('orders.length')}:</MeasurementLabel>
                    <MeasurementValue>{measurements.measurements.bottom.length ?? '—'}</MeasurementValue>
                  </MeasurementRow>
                  <MeasurementRow>
                    <MeasurementLabel>{t('orders.waist')}:</MeasurementLabel>
                    <MeasurementValue>{measurements.measurements.bottom.waist ?? '—'}</MeasurementValue>
                  </MeasurementRow>
                  <MeasurementRow>
                    <MeasurementLabel>{t('orders.hip')}:</MeasurementLabel>
                    <MeasurementValue>{measurements.measurements.bottom.hip ?? '—'}</MeasurementValue>
                  </MeasurementRow>
                  <MeasurementRow>
                    <MeasurementLabel>{t('orders.thigh')}:</MeasurementLabel>
                    <MeasurementValue>{measurements.measurements.bottom.thigh ?? '—'}</MeasurementValue>
                  </MeasurementRow>
                  <MeasurementRow>
                    <MeasurementLabel>{t('orders.knee')}:</MeasurementLabel>
                    <MeasurementValue>{measurements.measurements.bottom.knee ?? '—'}</MeasurementValue>
                  </MeasurementRow>
                  <MeasurementRow>
                    <MeasurementLabel>{t('orders.calf')}:</MeasurementLabel>
                    <MeasurementValue>{measurements.measurements.bottom.calf ?? '—'}</MeasurementValue>
                  </MeasurementRow>
                  <MeasurementRow>
                    <MeasurementLabel>{t('orders.bottom')}:</MeasurementLabel>
                    <MeasurementValue>{measurements.measurements.bottom.bottom ?? '—'}</MeasurementValue>
                  </MeasurementRow>
                  <MeasurementRow>
                    <MeasurementLabel>{t('orders.langot')}:</MeasurementLabel>
                    <MeasurementValue>{measurements.measurements.bottom.langot ?? '—'}</MeasurementValue>
                  </MeasurementRow>
                </MeasurementCard>
              )}
            </MeasurementsGrid>

            {!measurements.measurements.top && !measurements.measurements.bottom && (
              <EmptyState style={{ padding: '20px' }}>
                <EmptyStateText>{t('orders.viewMeasurements')} {t('common.noData')}</EmptyStateText>
              </EmptyState>
            )}
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default OrderDetailsPage;

