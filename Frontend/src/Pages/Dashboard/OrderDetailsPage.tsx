import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import {
  getOrderDetailsService,
  getWorkpieceMeasurementsService,
  type ProductOrderDetails,
  type WorkpieceMeasurements,
} from '../../Services/ApiServices/productOrderServices';
import Modal from '../../Components/Common/Modal';
import { useToast } from '../../Utils/ToastContext';
import { LoadingSpinner } from '../../Components/Common/FormComponents';
import {
  FaArrowLeft,
  FaRuler,
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
  const { showError } = useToast();

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
          <EmptyStateText>Order not found</EmptyStateText>
        </EmptyState>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Order Details - {order.id.substring(0, 8)}...</PageTitle>
        <BackButton onClick={() => navigate('/dashboard/orders')}>
          <FaArrowLeft /> Back to Orders
        </BackButton>
      </PageHeader>

      <OrderInfo>
        <InfoItem>
          <InfoLabel>Customer</InfoLabel>
          <InfoValue>{order.customerName || '—'}</InfoValue>
        </InfoItem>
        <InfoItem>
          <InfoLabel>Order Date</InfoLabel>
          <InfoValue>{formatDate(order.orderDate)}</InfoValue>
        </InfoItem>
        <InfoItem>
          <InfoLabel>Delivery Date</InfoLabel>
          <InfoValue>{formatDate(order.deliveryDate)}</InfoValue>
        </InfoItem>
        <InfoItem>
          <InfoLabel>Status</InfoLabel>
          <InfoValue>
            <StatusBadge status={order.status}>{order.status}</StatusBadge>
          </InfoValue>
        </InfoItem>
        {order.notes && (
          <InfoItem>
            <InfoLabel>Notes</InfoLabel>
            <InfoValue>{order.notes}</InfoValue>
          </InfoItem>
        )}
      </OrderInfo>

      <h3 style={{ marginBottom: '16px' }}>Work Pieces ({order.workPieces.length})</h3>
      {order.workPieces.length === 0 ? (
        <EmptyState>
          <EmptyStateText>No work pieces found for this order.</EmptyStateText>
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
                  Status: <StatusBadge status={workPiece.currentStatus}>{workPiece.currentStatus}</StatusBadge>
                </WorkPieceDetail>
                {workPiece.assignedTo && (
                  <WorkPieceDetail>Assigned to: {workPiece.assignedTo.fullName}</WorkPieceDetail>
                )}
                {workPiece.remarks && (
                  <WorkPieceDetail>Remarks: {workPiece.remarks}</WorkPieceDetail>
                )}
                <ViewMeasurementsButton
                  onClick={() => handleViewMeasurements(workPiece.id)}
                  disabled={loadingMeasurements}
                >
                  <FaRuler /> View Measurements
                </ViewMeasurementsButton>
              </WorkPieceInfo>
            </WorkPieceCard>
          ))}
        </WorkPieceGrid>
      )}

      {/* Measurements Modal */}
      <Modal
        isOpen={isMeasurementsModalOpen}
        onClose={() => setIsMeasurementsModalOpen(false)}
        title="Workpiece Measurements"
        size="large"
        footer={
          <ModalButtonSecondary onClick={() => setIsMeasurementsModalOpen(false)}>Close</ModalButtonSecondary>
        }
      >
        {measurements && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '12px' }}>Customer Information</h3>
              <p><strong>Name:</strong> {measurements.customer.fullName}</p>
              <p><strong>Email:</strong> {measurements.customer.emailId}</p>
              <p><strong>Mobile:</strong> {measurements.customer.mobileNo}</p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '12px' }}>Workpiece Information</h3>
              <p><strong>Product Item:</strong> {measurements.workpiece.productItem.name}</p>
              <p><strong>Status:</strong> <StatusBadge status={measurements.workpiece.currentStatus}>{measurements.workpiece.currentStatus}</StatusBadge></p>
            </div>

            <MeasurementsGrid>
              {measurements.measurements.top && (
                <MeasurementCard>
                  <MeasurementTitle>Top Measurements</MeasurementTitle>
                  <MeasurementRow>
                    <MeasurementLabel>Length:</MeasurementLabel>
                    <MeasurementValue>{measurements.measurements.top.length ?? '—'}</MeasurementValue>
                  </MeasurementRow>
                  <MeasurementRow>
                    <MeasurementLabel>Shoulder:</MeasurementLabel>
                    <MeasurementValue>{measurements.measurements.top.shoulder ?? '—'}</MeasurementValue>
                  </MeasurementRow>
                  <MeasurementRow>
                    <MeasurementLabel>Sleeve Length:</MeasurementLabel>
                    <MeasurementValue>{measurements.measurements.top.sleeveLength ?? '—'}</MeasurementValue>
                  </MeasurementRow>
                  <MeasurementRow>
                    <MeasurementLabel>Sleeve Bottom:</MeasurementLabel>
                    <MeasurementValue>{measurements.measurements.top.sleeveBottom ?? '—'}</MeasurementValue>
                  </MeasurementRow>
                  <MeasurementRow>
                    <MeasurementLabel>Chest:</MeasurementLabel>
                    <MeasurementValue>{measurements.measurements.top.chest ?? '—'}</MeasurementValue>
                  </MeasurementRow>
                  <MeasurementRow>
                    <MeasurementLabel>Waist:</MeasurementLabel>
                    <MeasurementValue>{measurements.measurements.top.waist ?? '—'}</MeasurementValue>
                  </MeasurementRow>
                  <MeasurementRow>
                    <MeasurementLabel>Hip:</MeasurementLabel>
                    <MeasurementValue>{measurements.measurements.top.hip ?? '—'}</MeasurementValue>
                  </MeasurementRow>
                  <MeasurementRow>
                    <MeasurementLabel>Neck:</MeasurementLabel>
                    <MeasurementValue>{measurements.measurements.top.neck ?? '—'}</MeasurementValue>
                  </MeasurementRow>
                </MeasurementCard>
              )}

              {measurements.measurements.bottom && (
                <MeasurementCard>
                  <MeasurementTitle>Bottom Measurements</MeasurementTitle>
                  <MeasurementRow>
                    <MeasurementLabel>Length:</MeasurementLabel>
                    <MeasurementValue>{measurements.measurements.bottom.length ?? '—'}</MeasurementValue>
                  </MeasurementRow>
                  <MeasurementRow>
                    <MeasurementLabel>Waist:</MeasurementLabel>
                    <MeasurementValue>{measurements.measurements.bottom.waist ?? '—'}</MeasurementValue>
                  </MeasurementRow>
                  <MeasurementRow>
                    <MeasurementLabel>Hip:</MeasurementLabel>
                    <MeasurementValue>{measurements.measurements.bottom.hip ?? '—'}</MeasurementValue>
                  </MeasurementRow>
                  <MeasurementRow>
                    <MeasurementLabel>Thigh:</MeasurementLabel>
                    <MeasurementValue>{measurements.measurements.bottom.thigh ?? '—'}</MeasurementValue>
                  </MeasurementRow>
                  <MeasurementRow>
                    <MeasurementLabel>Knee:</MeasurementLabel>
                    <MeasurementValue>{measurements.measurements.bottom.knee ?? '—'}</MeasurementValue>
                  </MeasurementRow>
                  <MeasurementRow>
                    <MeasurementLabel>Calf:</MeasurementLabel>
                    <MeasurementValue>{measurements.measurements.bottom.calf ?? '—'}</MeasurementValue>
                  </MeasurementRow>
                  <MeasurementRow>
                    <MeasurementLabel>Bottom:</MeasurementLabel>
                    <MeasurementValue>{measurements.measurements.bottom.bottom ?? '—'}</MeasurementValue>
                  </MeasurementRow>
                  <MeasurementRow>
                    <MeasurementLabel>Langot:</MeasurementLabel>
                    <MeasurementValue>{measurements.measurements.bottom.langot ?? '—'}</MeasurementValue>
                  </MeasurementRow>
                </MeasurementCard>
              )}
            </MeasurementsGrid>

            {!measurements.measurements.top && !measurements.measurements.bottom && (
              <EmptyState style={{ padding: '20px' }}>
                <EmptyStateText>No measurements available for this workpiece.</EmptyStateText>
              </EmptyState>
            )}
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default OrderDetailsPage;

