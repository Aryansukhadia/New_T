import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { isAuthenticated, removeAuthToken } from '../Services/ApiServices';
import Button from '../style';

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
          <Button onClick={() => navigate('/admin/create-user')}>
            Create User (Admin)
          </Button>
          <Button onClick={handleLogout} style={{ background: '#dc3545' }}>
            Logout
          </Button>
        </ButtonGroup>
      </ContentCard>
    </HomeContainer>
  );
};

export default Home;

