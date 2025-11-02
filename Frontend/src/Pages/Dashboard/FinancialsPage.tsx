import styled from 'styled-components';

const PageContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 24px;
`;

const FinancialsPage = () => {
  return (
    <PageContainer>
      <PageTitle>Financials</PageTitle>
      <p>Financials page - Admin and Accountant access</p>
      {/* TODO: Implement financials functionality */}
    </PageContainer>
  );
};

export default FinancialsPage;

