import { Box, Card, CardContent, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { getUserInfo, type LoginResponse } from '../../Services/ApiServices';
import {
  People as PeopleIcon,
  Straighten as StraightenIcon,
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as AttachMoneyIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import MUICustomBtn from '../../Components/Common/MUICustomBtn';

const DashboardHome = () => {
  const userInfo: LoginResponse | null = getUserInfo();
  const role = userInfo?.roleName || 'User';

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
          Welcome back, {userInfo?.fullName || 'User'}!
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          You're logged in as {role}
        </Typography>
      </Card>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 1.5,
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 12px rgba(0, 0, 0, 0.15)',
              },
            }}
          >
            <CardContent>
              <Box sx={{ color: '#667eea', mb: 1.5 }}>
                <PeopleIcon sx={{ fontSize: 32 }} />
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Customers
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                0
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 1.5,
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 12px rgba(0, 0, 0, 0.15)',
              },
            }}
          >
            <CardContent>
              <Box sx={{ color: '#667eea', mb: 1.5 }}>
                <StraightenIcon sx={{ fontSize: 32 }} />
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Measurements
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                0
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 1.5,
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 12px rgba(0, 0, 0, 0.15)',
              },
            }}
          >
            <CardContent>
              <Box sx={{ color: '#667eea', mb: 1.5 }}>
                <ShoppingCartIcon sx={{ fontSize: 32 }} />
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Active Orders
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                0
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 1.5,
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 12px rgba(0, 0, 0, 0.15)',
              },
            }}
          >
            <CardContent>
              <Box sx={{ color: '#667eea', mb: 1.5 }}>
                <AttachMoneyIcon sx={{ fontSize: 32 }} />
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Revenue
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                $0
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 1.5 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid xs={12} sm={6} md={3}>
              <MUICustomBtn
                fullWidth
                variant="outlined"
                startIcon={<PeopleIcon />}
                tooltip="Add a new customer to the system"
                sx={{
                  py: 2,
                  textAlign: 'left',
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  borderColor: '#e0e0e0',
                  color: '#333',
                  '&:hover': {
                    background: '#667eea',
                    color: 'white',
                    borderColor: '#667eea',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                + Add New Customer
              </MUICustomBtn>
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <MUICustomBtn
                fullWidth
                variant="outlined"
                startIcon={<StraightenIcon />}
                tooltip="Add measurements for customers"
                sx={{
                  py: 2,
                  textAlign: 'left',
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  borderColor: '#e0e0e0',
                  color: '#333',
                  '&:hover': {
                    background: '#667eea',
                    color: 'white',
                    borderColor: '#667eea',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Add Measurements
              </MUICustomBtn>
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <MUICustomBtn
                fullWidth
                variant="outlined"
                startIcon={<ShoppingCartIcon />}
                tooltip="Create a new order"
                sx={{
                  py: 2,
                  textAlign: 'left',
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  borderColor: '#e0e0e0',
                  color: '#333',
                  '&:hover': {
                    background: '#667eea',
                    color: 'white',
                    borderColor: '#667eea',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Create Order
              </MUICustomBtn>
            </Grid>
            {(role.toLowerCase() === 'admin' || role.toLowerCase() === 'accountant') && (
              <Grid xs={12} sm={6} md={3}>
                <MUICustomBtn
                  fullWidth
                  variant="outlined"
                  startIcon={<TrendingUpIcon />}
                  tooltip="View detailed reports and analytics"
                  sx={{
                    py: 2,
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    borderColor: '#e0e0e0',
                    color: '#333',
                    '&:hover': {
                      background: '#667eea',
                      color: 'white',
                      borderColor: '#667eea',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  View Reports
                </MUICustomBtn>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardHome;

