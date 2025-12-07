import { Box, Card, Typography } from '@mui/material';
import { getUserInfo, type LoginResponse } from '../../Services/ApiServices';

const DashboardHome = () => {
  const userInfo: LoginResponse | null = getUserInfo();
  const role = userInfo?.role;

  return (
    <Box sx={{ maxWidth: '100%' }}>
      <Card
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 2,
          p: 5,
          color: 'white',
          mb: 4,
          boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
          Welcome back, {userInfo?.fullName}!
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          You're logged in as {role}
        </Typography>
      </Card>
    </Box>
  );
};

export default DashboardHome;

