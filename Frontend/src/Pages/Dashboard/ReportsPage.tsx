import { Card, Typography } from '@mui/material';

const ReportsPage = () => {
  return (
    <Card sx={{ borderRadius: 1.5, p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Reports
      </Typography>
      <Typography variant="body1">Reports page - Admin and Accountant access</Typography>
      {/* TODO: Implement reports functionality */}
    </Card>
  );
};

export default ReportsPage;

