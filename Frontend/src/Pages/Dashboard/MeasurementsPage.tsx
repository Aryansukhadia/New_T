import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
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

const ActionButton = styled.button`
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

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
`;

const MeasurementsPage = () => {
  const navigate = useNavigate();

  const handleAddMeasurement = () => {
    navigate('/dashboard/measurements/add');
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Measurements Management</PageTitle>
        <ActionButton onClick={handleAddMeasurement}>
          <FaRuler />
          Add Measurements
        </ActionButton>
      </PageHeader>

      <p style={{ color: '#666', marginBottom: '24px' }}>
        Manage customer measurements for top and bottom garments. Select a customer and enter their measurements.
      </p>
    </PageContainer>
  );
};

export default MeasurementsPage;
