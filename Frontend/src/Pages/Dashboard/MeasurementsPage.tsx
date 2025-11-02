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

const MeasurementsPage = () => {
  return (
    <PageContainer>
      <PageTitle>Measurements</PageTitle>
      <p>Measurements management page - Admin and Staff access</p>
      {/* TODO: Implement measurements list, create, edit, delete */}
    </PageContainer>
  );
};

export default MeasurementsPage;

