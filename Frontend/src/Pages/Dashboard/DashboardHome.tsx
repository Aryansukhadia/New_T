import styled from 'styled-components';
import { getUserInfo } from '../../ApiDetails/AuthApi';
import type { LoginResponse } from '../../ApiDetails/AuthApi';
import { FaUsers, FaRuler, FaShoppingCart, FaDollarSign, FaChartLine } from 'react-icons/fa';

const DashboardContainer = styled.div`
  max-width: 100%;
`;

const WelcomeCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 40px;
  color: white;
  margin-bottom: 32px;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
`;

const WelcomeTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const WelcomeSubtitle = styled.p`
  font-size: 18px;
  opacity: 0.9;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
  }
`;

const StatIcon = styled.div`
  font-size: 32px;
  margin-bottom: 12px;
  color: #667eea;
  display: flex;
  align-items: center;
  
  svg {
    width: 32px;
    height: 32px;
  }
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #333;
`;

const QuickActions = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const ActionButton = styled.button`
  padding: 16px;
  background: #f8f9fa;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  &:hover {
    background: #667eea;
    color: white;
    border-color: #667eea;
    transform: translateY(-2px);
  }
`;

const DashboardHome = () => {
  const userInfo: LoginResponse | null = getUserInfo();
  const role = userInfo?.roleName || 'User';

  return (
    <DashboardContainer>
      <WelcomeCard>
        <WelcomeTitle>Welcome back, {userInfo?.fullName || 'User'}!</WelcomeTitle>
        <WelcomeSubtitle>You're logged in as {role}</WelcomeSubtitle>
      </WelcomeCard>

      <StatsGrid>
        <StatCard>
          <StatIcon><FaUsers /></StatIcon>
          <StatLabel>Total Customers</StatLabel>
          <StatValue>0</StatValue>
        </StatCard>
        <StatCard>
          <StatIcon><FaRuler /></StatIcon>
          <StatLabel>Measurements</StatLabel>
          <StatValue>0</StatValue>
        </StatCard>
        <StatCard>
          <StatIcon><FaShoppingCart /></StatIcon>
          <StatLabel>Active Orders</StatLabel>
          <StatValue>0</StatValue>
        </StatCard>
        <StatCard>
          <StatIcon><FaDollarSign /></StatIcon>
          <StatLabel>Revenue</StatLabel>
          <StatValue>$0</StatValue>
        </StatCard>
      </StatsGrid>

      <QuickActions>
        <SectionTitle>Quick Actions</SectionTitle>
        <ActionsGrid>
          <ActionButton>
            <FaUsers /> + Add New Customer
          </ActionButton>
          <ActionButton>
            <FaRuler /> Add Measurements
          </ActionButton>
          <ActionButton>
            <FaShoppingCart /> Create Order
          </ActionButton>
          {(role.toLowerCase() === 'admin' || role.toLowerCase() === 'accountant') && (
            <ActionButton>
              <FaChartLine /> View Reports
            </ActionButton>
          )}
        </ActionsGrid>
      </QuickActions>
    </DashboardContainer>
  );
};

export default DashboardHome;

