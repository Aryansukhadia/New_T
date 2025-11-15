import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { isAuthenticated, removeAuthToken } from '../Services/ApiServices';
import MUICustomBtn from '../Components/Common/MUICustomBtn';

const HomeContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const ContentCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #333;
  margin-bottom: 16px;
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: #666;
  margin-bottom: 32px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
`;

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    removeAuthToken();
    navigate('/login');
  };

  return (
    <HomeContainer>
      <ContentCard>
        <Title>Welcome to Tailor Project</Title>
        <Subtitle>You are successfully logged in!</Subtitle>
        <ButtonGroup>
          <MUICustomBtn
            onClick={() => navigate('/admin/create-user')}
            tooltip="Create a new user account (Admin only)"
            variant="contained"
            color="primary"
          >
            Create User (Admin)
          </MUICustomBtn>
          <MUICustomBtn
            onClick={handleLogout}
            tooltip="Sign out of your account"
            variant="contained"
            color="error"
            sx={{ backgroundColor: '#dc3545' }}
          >
            Logout
          </MUICustomBtn>
        </ButtonGroup>
      </ContentCard>
    </HomeContainer>
  );
};

export default Home;

